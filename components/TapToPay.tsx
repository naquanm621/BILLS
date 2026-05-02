"use client";

import { useState, useEffect } from "react";
import { Bill } from "@/data/bills";
import { CreditCard, Shield, Lock, Check, X, Loader2, Receipt, Wallet } from "lucide-react";

interface TapToPayProps {
  bill: Bill;
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: (receipt: any) => void;
}

interface VirtualCard {
  token: string;
  maskedCard: string;
  last4: string;
  expiry: string;
  cardholderName: string;
}

export default function TapToPay({ bill, isOpen, onClose, onPaymentComplete }: TapToPayProps) {
  const [step, setStep] = useState<'select-card' | 'add-card' | 'confirm' | 'processing' | 'success' | 'error'>('select-card');
  const [savedCards, setSavedCards] = useState<VirtualCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<VirtualCard | null>(null);
  const [paymentToken, setPaymentToken] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<any>(null);
  const [error, setError] = useState<string>('');
  
  // New card form
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  // Load saved cards on mount
  useEffect(() => {
    const cards = localStorage.getItem('virtualCards');
    if (cards) {
      setSavedCards(JSON.parse(cards));
    }
  }, []);

  // Save cards when updated
  useEffect(() => {
    if (savedCards.length > 0) {
      localStorage.setItem('virtualCards', JSON.stringify(savedCards));
    }
  }, [savedCards]);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setStep('select-card');
      setSelectedCard(null);
      setPaymentToken(null);
      setReceipt(null);
      setError('');
    }
  }, [isOpen]);

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Handle card number input
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) {
      setCardNumber(formatted);
    }
  };

  // Tokenize new card
  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    
    try {
      const response = await fetch('http://localhost:3001/payment/tokenize-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardNumber: cardNumber.replace(/\s/g, ''),
          expiryMonth,
          expiryYear,
          cvc,
          cardholderName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newCard: VirtualCard = {
          token: data.token,
          maskedCard: data.maskedCard,
          last4: data.last4,
          expiry: data.expiry,
          cardholderName: data.cardholderName,
        };
        
        setSavedCards([...savedCards, newCard]);
        setSelectedCard(newCard);
        
        // Clear form
        setCardNumber('');
        setExpiryMonth('');
        setExpiryYear('');
        setCvc('');
        setCardholderName('');
        
        setStep('select-card');
      } else {
        setError(data.error || 'Failed to add card');
        setStep('error');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setStep('error');
    }
  };

  // Create payment intent
  const handleSelectCard = async (card: VirtualCard) => {
    setSelectedCard(card);
    setStep('processing');

    try {
      const response = await fetch('http://localhost:3001/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          virtualCardToken: card.token,
          amount: bill.amount,
          vendorId: bill.id,
          vendorName: bill.vendor,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPaymentToken(data.paymentToken);
        setStep('confirm');
      } else {
        setError(data.error || 'Failed to create payment');
        setStep('error');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setStep('error');
    }
  };

  // Confirm payment (the actual tap to pay)
  const handleConfirmPayment = async () => {
    if (!paymentToken) return;
    
    setStep('processing');

    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate([50, 100, 50]);
    }

    try {
      const response = await fetch('http://localhost:3001/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentToken,
          vendorInfo: {
            id: bill.id,
            name: bill.vendor,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setReceipt(data.receipt);
        setStep('success');
        onPaymentComplete(data.receipt);
        
        // Success haptic
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
      } else {
        setError(data.error || 'Payment failed');
        setStep('error');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setStep('error');
    }
  };

  // Delete saved card
  const handleDeleteCard = async (token: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await fetch(`http://localhost:3001/payment/revoke-card/${token}`, {
        method: 'DELETE',
      });
      
      setSavedCards(savedCards.filter(c => c.token !== token));
    } catch (err) {
      console.error('Failed to delete card:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-2xl flex items-center justify-center">
              <Shield size={20} className="text-black" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Secure Pay</h2>
              <p className="text-zinc-500 text-xs">Tokenized • Encrypted</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700"
          >
            <X size={16} />
          </button>
        </div>

        {/* Bill Summary */}
        <div className="p-6 bg-zinc-800/50">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold text-white ${bill.color}`}>
              {bill.vendor[0]}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{bill.vendor}</p>
              <p className="text-zinc-400 text-sm">Due {bill.dueDate}</p>
            </div>
            <p className="text-2xl font-bold text-green-400">${bill.amount.toFixed(2)}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* SELECT CARD STEP */}
          {step === 'select-card' && (
            <div className="space-y-4">
              <h3 className="font-semibold mb-4">Choose your payment method</h3>
              
              {savedCards.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet size={48} className="mx-auto text-zinc-600 mb-4" />
                  <p className="text-zinc-500">No saved cards</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedCards.map((card) => (
                    <button
                      key={card.token}
                      onClick={() => handleSelectCard(card)}
                      className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                        selectedCard?.token === card.token 
                          ? 'border-green-500 bg-green-500/10' 
                          : 'border-zinc-700 hover:border-zinc-600'
                      }`}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <CreditCard size={20} className="text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-mono text-lg">{card.maskedCard}</p>
                        <p className="text-zinc-400 text-sm">{card.cardholderName} • Exp {card.expiry}</p>
                      </div>
                      <button 
                        onClick={(e) => handleDeleteCard(card.token, e)}
                        className="p-2 hover:bg-red-500/20 rounded-lg text-zinc-500 hover:text-red-400"
                      >
                        <X size={16} />
                      </button>
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => setStep('add-card')}
                className="w-full p-4 rounded-2xl border-2 border-dashed border-zinc-700 hover:border-green-500 hover:bg-green-500/5 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                <span>Add New Card</span>
              </button>
            </div>
          )}

          {/* ADD CARD STEP */}
          {step === 'add-card' && (
            <form onSubmit={handleAddCard} className="space-y-4">
              <h3 className="font-semibold mb-4">Add Payment Card</h3>
              <p className="text-xs text-zinc-500">Card details are tokenized and encrypted</p>
              
              <div>
                <label className="text-zinc-400 text-sm mb-1 block">Card Number</label>
                <div className="relative">
                  <CreditCard size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="4242 4242 4242 4242"
                    className="w-full bg-zinc-800 rounded-xl py-3 pl-12 pr-4 font-mono text-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-zinc-400 text-sm mb-1 block">Month</label>
                  <input
                    type="text"
                    value={expiryMonth}
                    onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                    placeholder="MM"
                    className="w-full bg-zinc-800 rounded-xl py-3 px-4 text-center"
                    required
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="text-zinc-400 text-sm mb-1 block">Year</label>
                  <input
                    type="text"
                    value={expiryYear}
                    onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, '').slice(0, 2))}
                    placeholder="YY"
                    className="w-full bg-zinc-800 rounded-xl py-3 px-4 text-center"
                    required
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="text-zinc-400 text-sm mb-1 block">CVC</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="password"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="123"
                      className="w-full bg-zinc-800 rounded-xl py-3 pl-10 pr-4"
                      required
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 text-sm mb-1 block">Cardholder Name</label>
                <input
                  type="text"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-zinc-800 rounded-xl py-3 px-4"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep('select-card')}
                  className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-medium"
                >
                  Save Card Securely
                </button>
              </div>

              <p className="text-xs text-zinc-500 text-center flex items-center justify-center gap-1">
                <Lock size={12} />
                Your card is tokenized and encrypted. We never store raw card data.
              </p>
            </form>
          )}

          {/* CONFIRM STEP */}
          {step === 'confirm' && selectedCard && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <Wallet size={32} className="text-black" />
                </div>
              </div>

              <div>
                <p className="text-zinc-400 mb-2">Tap to pay</p>
                <p className="text-3xl font-bold">${bill.amount.toFixed(2)}</p>
                <p className="text-zinc-400 mt-1">to {bill.vendor}</p>
              </div>

              <div className="bg-zinc-800 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <CreditCard size={20} className="text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-mono">{selectedCard.maskedCard}</p>
                  <p className="text-zinc-400 text-sm">{selectedCard.cardholderName}</p>
                </div>
              </div>

              <p className="text-xs text-zinc-500 flex items-center justify-center gap-1">
                <Shield size={12} />
                Secured by virtual card token • End-to-end encrypted
              </p>

              <button
                onClick={handleConfirmPayment}
                className="w-full py-4 rounded-2xl bg-green-500 hover:bg-green-400 text-black font-bold text-lg transition-all active:scale-95"
              >
                TAP TO PAY NOW
              </button>

              <button
                onClick={() => setStep('select-card')}
                className="text-zinc-500 hover:text-white"
              >
                Choose different card
              </button>
            </div>
          )}

          {/* PROCESSING STEP */}
          {step === 'processing' && (
            <div className="text-center py-12">
              <Loader2 size={48} className="mx-auto animate-spin text-green-500 mb-4" />
              <p className="text-lg font-medium">Processing securely...</p>
              <p className="text-zinc-500 text-sm mt-2">Tokenizing payment data</p>
            </div>
          )}

          {/* SUCCESS STEP */}
          {step === 'success' && receipt && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <Check size={40} className="text-black" />
              </div>

              <div>
                <p className="text-2xl font-bold text-green-400">Payment Sent!</p>
                <p className="text-zinc-400 mt-1">{receipt.vendor}</p>
              </div>

              {/* Secure Receipt */}
              <div className="bg-zinc-800 rounded-2xl p-6 text-left">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-zinc-700">
                  <Receipt size={20} className="text-green-500" />
                  <span className="font-semibold">Secure Receipt</span>
                  <Lock size={14} className="text-zinc-500 ml-auto" />
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Amount</span>
                    <span className="font-mono font-bold">${receipt.amount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Payment ID</span>
                    <span className="font-mono text-xs">{receipt.id?.slice(-12)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Card Used</span>
                    <span className="font-mono">{receipt.maskedCard}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Status</span>
                    <span className="text-green-400 capitalize">{receipt.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Time</span>
                    <span>{new Date(receipt.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-700">
                  <p className="text-xs text-zinc-500 text-center">
                    This receipt shows masked data only.\n                    Full transaction details are tokenized.
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-medium"
              >
                Done
              </button>
            </div>
          )}

          {/* ERROR STEP */}
          {step === 'error' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <X size={32} className="text-red-500" />
              </div>
              <p className="text-lg font-medium text-red-400">Payment Failed</p>
              <p className="text-zinc-400 mt-2">{error}</p>
              <button
                onClick={() => setStep('select-card')}
                className="mt-6 px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Plus icon component
function Plus({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
