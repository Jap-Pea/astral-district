// src/pages/LoanShark.tsx
import React, { useState, useMemo } from 'react'
import { PageContainer } from '../components/ui/PageContainer'
import { GlassCard } from '../components/ui/GlassCard'
import { GradientButton } from '../components/ui/GradientButton'
import { useUser } from '../hooks/useUser'
import type { Loan, LoanHistory } from '../types/user.types'

const LoanShark: React.FC = () => {
  const { user, updateUser, addMoney, spendMoney } = useUser()
  const [loanAmount, setLoanAmount] = useState<number>(0)
  const [selectedDuration, setSelectedDuration] = useState<number>(7) // days
  const [showConfirm, setShowConfirm] = useState(false)
  const [loanSharkMood, setLoanSharkMood] = useState<'happy' | 'neutral' | 'angry'>('neutral')
  const [currentTime] = useState(() => Date.now())
  const [repayInputs, setRepayInputs] = useState<Record<string, number>>({})

  // Initialize loan history from user data
  const loanHistory: LoanHistory = useMemo(() => {
    const history = user?.loanHistory || {
      totalLoans: 0,
      paidOnTime: 0,
      paidLate: 0,
      defaulted: 0,
      currentLoans: [],
      pastLoans: []
    }
    return history
  }, [user])

  // Calculate credit rating based on history
  const creditRating = useMemo(() => {
    if (loanHistory.totalLoans === 0) return 'New Customer'
    
    const onTimeRate = loanHistory.paidOnTime / loanHistory.totalLoans
    const defaultRate = loanHistory.defaulted / loanHistory.totalLoans

    if (defaultRate > 0.3) return 'Very Poor'
    if (defaultRate > 0.1) return 'Poor'
    if (onTimeRate > 0.9) return 'Excellent'
    if (onTimeRate > 0.7) return 'Good'
    if (onTimeRate > 0.5) return 'Fair'
    return 'Poor'
  }, [loanHistory])

  // Calculate max loan based on level and credit history
  const maxLoanAmount = useMemo(() => {
    if (!user) return 0
    
    const baseAmount = user.level * 5000 // $5k per level
    
    // Credit multiplier
    const creditMultipliers: Record<string, number> = {
      'New Customer': 1.0,
      'Very Poor': 0.3,
      'Poor': 0.5,
      'Fair': 0.8,
      'Good': 1.2,
      'Excellent': 1.5
    }
    
    const creditMultiplier = creditMultipliers[creditRating] || 1.0
    
    // Loyalty bonus for repeat customers with good history
    const loyaltyBonus = Math.min(loanHistory.paidOnTime * 1000, 20000)
    
    return Math.floor((baseAmount * creditMultiplier) + loyaltyBonus)
  }, [user, creditRating, loanHistory])

  // Calculate interest rate based on credit and duration
  const interestRate = useMemo(() => {
    const baseRate = 0.15 // 15% base
    
    const creditRateAdjustment: Record<string, number> = {
      'New Customer': 0.05,
      'Very Poor': 0.15,
      'Poor': 0.10,
      'Fair': 0.05,
      'Good': -0.03,
      'Excellent': -0.05
    }
    
    const durationMultiplier = selectedDuration / 7 // 7 days baseline
    
    const rate = baseRate + (creditRateAdjustment[creditRating] || 0) + (durationMultiplier * 0.02)
    
    return Math.max(0.05, Math.min(0.50, rate)) // Cap between 5% and 50%
  }, [creditRating, selectedDuration])

  const totalOwed = useMemo(() => {
    return Math.floor(loanAmount * (1 + interestRate))
  }, [loanAmount, interestRate])

  const hasActiveLoan = loanHistory.currentLoans.length > 0

  const getOutstanding = (loan: Loan) => {
    const paid = loan.paidAmount ?? 0
    return Math.max(loan.totalOwed - paid, 0)
  }

  const takeLoan = () => {
    if (!user || loanAmount <= 0 || loanAmount > maxLoanAmount) return
    
    const newLoan: Loan = {
      id: `loan_${Date.now()}`,
      amount: loanAmount,
      interest: interestRate,
      totalOwed: totalOwed,
      takenAt: new Date(),
      dueDate: new Date(Date.now() + selectedDuration * 24 * 60 * 60 * 1000),
      isPaid: false,
      wasLate: false
    }

    const updatedHistory: LoanHistory = {
      ...loanHistory,
      totalLoans: loanHistory.totalLoans + 1,
      currentLoans: [...loanHistory.currentLoans, newLoan]
    }

    addMoney(loanAmount)
    updateUser({ loanHistory: updatedHistory })
    
    setLoanAmount(0)
    setShowConfirm(false)
    setLoanSharkMood('happy')
    
    setTimeout(() => setLoanSharkMood('neutral'), 3000)
  }

  const repayLoan = (loanId: string) => {
    if (!user) return
    
    const loan = loanHistory.currentLoans.find(l => l.id === loanId)
    if (!loan) return

    const outstanding = getOutstanding(loan)
    if (user.money < outstanding) {
      alert("You don't have enough money to repay this loan!")
      setLoanSharkMood('angry')
      setTimeout(() => setLoanSharkMood('neutral'), 3000)
      return
    }

    const now = new Date()
    const wasLate = now > loan.dueDate

    const paidLoan: Loan = {
      ...loan,
      isPaid: true,
      paidAt: now,
      wasLate: wasLate
    }

    const updatedHistory: LoanHistory = {
      ...loanHistory,
      currentLoans: loanHistory.currentLoans.filter(l => l.id !== loanId),
      pastLoans: [...loanHistory.pastLoans, paidLoan],
      paidOnTime: wasLate ? loanHistory.paidOnTime : loanHistory.paidOnTime + 1,
      paidLate: wasLate ? loanHistory.paidLate + 1 : loanHistory.paidLate
    }

    spendMoney(outstanding)
    updateUser({ loanHistory: updatedHistory })
    
    setLoanSharkMood(wasLate ? 'neutral' : 'happy')
    setTimeout(() => setLoanSharkMood('neutral'), 3000)
  }

  const repayLoanPartial = (loanId: string) => {
    if (!user) return
    const loan = loanHistory.currentLoans.find(l => l.id === loanId)
    if (!loan) return

    const raw = repayInputs[loanId] ?? 0
    const amount = Math.max(0, Math.floor(raw))
    const outstanding = getOutstanding(loan)
    const cap = Math.min(outstanding, user.money)
    const finalAmount = Math.min(amount, cap)

    if (finalAmount <= 0) {
      setLoanSharkMood('angry')
      setTimeout(() => setLoanSharkMood('neutral'), 1500)
      return
    }

    const ok = spendMoney(finalAmount)
    if (!ok) {
      setLoanSharkMood('angry')
      setTimeout(() => setLoanSharkMood('neutral'), 1500)
      return
    }

    const now = new Date()
    const newPaid = (loan.paidAmount ?? 0) + finalAmount
    const remaining = Math.max(loan.totalOwed - newPaid, 0)

    if (remaining <= 0) {
      const wasLate = now > loan.dueDate
      const paidLoan: Loan = {
        ...loan,
        paidAmount: newPaid,
        isPaid: true,
        paidAt: now,
        wasLate,
      }

      const updatedHistory: LoanHistory = {
        ...loanHistory,
        currentLoans: loanHistory.currentLoans.filter(l => l.id !== loanId),
        pastLoans: [...loanHistory.pastLoans, paidLoan],
        paidOnTime: wasLate ? loanHistory.paidOnTime : loanHistory.paidOnTime + 1,
        paidLate: wasLate ? loanHistory.paidLate + 1 : loanHistory.paidLate,
      }

      updateUser({ loanHistory: updatedHistory })
      setRepayInputs((m) => ({ ...m, [loanId]: 0 }))
      setLoanSharkMood(wasLate ? 'neutral' : 'happy')
      setTimeout(() => setLoanSharkMood('neutral'), 3000)
      return
    }

    // Still outstanding: update paidAmount on current loan
    const updatedHistory: LoanHistory = {
      ...loanHistory,
      currentLoans: loanHistory.currentLoans.map(l =>
        l.id === loanId ? { ...l, paidAmount: newPaid } : l
      ),
    }
    updateUser({ loanHistory: updatedHistory })
    setLoanSharkMood('neutral')
  }

  const getCreditRatingColor = (rating: string) => {
    const colors: Record<string, string> = {
      'Excellent': '#22c55e',
      'Good': '#3b82f6',
      'Fair': '#f59e0b',
      'Poor': '#ef4444',
      'Very Poor': '#7f1d1d',
      'New Customer': '#6b7280'
    }
    return colors[rating] || '#6b7280'
  }

  const getLoanSharkImage = () => {
    // Replace with actual image paths
    const images = {
      happy: 'https://placehold.co/400x500/2a5c2a/fff?text=Happy+Shark',
      neutral: 'https://placehold.co/400x500/4a5568/fff?text=Loan+Shark',
      angry: 'https://placehold.co/400x500/7f1d1d/fff?text=Angry+Shark'
    }
    return images[loanSharkMood]
  }

  const getLoanSharkDialogue = () => {
    if (hasActiveLoan) {
      return "You still owe me money! Pay up before asking for more."
    }
    
    const dialogues = {
      'Excellent': "Ah, my favorite customer! Always a pleasure doing business with you.",
      'Good': "Good to see you again. Your credit's solid, let's talk numbers.",
      'Fair': "You're not the worst I've dealt with. What do you need?",
      'Poor': "You're pushing your luck with me. This better be quick.",
      'Very Poor': "You got some nerve showing your face here...",
      'New Customer': "New around here? Let me explain how this works..."
    }
    
    return dialogues[creditRating as keyof typeof dialogues] || dialogues['New Customer']
  }

  if (!user) return null

  return (
    <PageContainer>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .loan-shark-container {
          animation: fadeIn 0.5s ease-out;
        }

        .shake-animation {
          animation: shake 0.5s ease-in-out;
        }

        .slider {
          -webkit-appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 5px;
          background: rgba(255, 255, 255, 0.1);
          outline: none;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .slider:hover {
          opacity: 1;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #4a9eff;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(74, 158, 255, 0.5);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #4a9eff;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(74, 158, 255, 0.5);
        }
      `}</style>

      <div className="loan-shark-container">
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#ef4444',
          marginBottom: '0.5rem',
          textShadow: '0 0 20px rgba(239, 68, 68, 0.5)'
        }}>
          💰 The Loan Shark
        </h1>
        <p style={{ color: '#6ba3bf', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Need quick cash? I can help... for a price.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '2rem' }}>
          {/* Loan Shark Character */}
          <GlassCard className={loanSharkMood === 'angry' ? 'shake-animation' : ''}>
            <div style={{
              width: '100%',
              height: '500px',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '1rem',
              border: '2px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(0, 0, 0, 0.3)'
            }}>
              <img
                src={getLoanSharkImage()}
                alt="Loan Shark"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>

            {/* Dialogue Box */}
            <div style={{
              padding: '1.5rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              fontStyle: 'italic',
              color: '#fff',
              lineHeight: '1.6'
            }}>
              "{getLoanSharkDialogue()}"
            </div>

            {/* Credit Rating */}
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.9rem', color: '#6ba3bf', marginBottom: '0.5rem' }}>
                Your Credit Rating
              </div>
              <div style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: getCreditRatingColor(creditRating),
                textShadow: `0 0 10px ${getCreditRatingColor(creditRating)}80`
              }}>
                {creditRating}
              </div>
            </div>
          </GlassCard>

          {/* Loan Interface */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Stats Overview */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem'
            }}>
              <GlassCard>
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6ba3bf', marginBottom: '0.5rem' }}>
                    Max Loan
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22c55e' }}>
                    ${maxLoanAmount.toLocaleString()}
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6ba3bf', marginBottom: '0.5rem' }}>
                    Interest Rate
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                    {(interestRate * 100).toFixed(1)}%
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6ba3bf', marginBottom: '0.5rem' }}>
                    Total Loans
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>
                    {loanHistory.totalLoans}
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6ba3bf', marginBottom: '0.5rem' }}>
                    On-Time %
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                    {loanHistory.totalLoans > 0 
                      ? Math.round((loanHistory.paidOnTime / loanHistory.totalLoans) * 100)
                      : 0}%
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Active Loans */}
            {loanHistory.currentLoans.length > 0 && (
              <GlassCard>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  color: '#ef4444'
                }}>
                  ⚠️ Active Loans
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {loanHistory.currentLoans.map(loan => {
                    const daysLeft = Math.ceil((loan.dueDate.getTime() - currentTime) / (1000 * 60 * 60 * 24))
                    const isOverdue = daysLeft < 0
                    
                    return (
                      <div
                        key={loan.id}
                        style={{
                          padding: '1.5rem',
                          background: isOverdue 
                            ? 'rgba(239, 68, 68, 0.1)' 
                            : 'rgba(255, 255, 255, 0.05)',
                          border: isOverdue 
                            ? '2px solid #ef4444' 
                            : '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '1rem'
                        }}>
                          <div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
                              ${loan.totalOwed.toLocaleString()}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#6ba3bf' }}>
                              Principal: ${loan.amount.toLocaleString()} + {(loan.interest * 100).toFixed(1)}% interest
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{
                              fontSize: '1.1rem',
                              fontWeight: 'bold',
                              color: isOverdue ? '#ef4444' : daysLeft <= 2 ? '#f59e0b' : '#22c55e'
                            }}>
                              {isOverdue ? 'OVERDUE!' : `${daysLeft} days left`}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#6ba3bf' }}>
                              Due: {loan.dueDate.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {/* Outstanding and Partial Repay Controls */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr',
                          gap: '0.5rem',
                          marginBottom: '0.75rem',
                          color: '#6ba3bf'
                        }}>
                          <div>
                            <strong style={{ color: '#fff' }}>Outstanding:</strong>{' '}
                            ${getOutstanding(loan).toLocaleString()}
                            {loan.paidAmount ? (
                              <span style={{ marginLeft: '8px', fontSize: '0.85rem' }}>
                                (Paid so far: ${loan.paidAmount.toLocaleString()})
                              </span>
                            ) : null}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                              type="number"
                              min={0}
                              value={repayInputs[loan.id] ?? ''}
                              onChange={(e) => setRepayInputs((m) => ({ ...m, [loan.id]: Number(e.target.value) }))}
                              placeholder="Enter amount"
                              style={{
                                flex: 1,
                                padding: '0.5rem 0.75rem',
                                borderRadius: 8,
                                border: '1px solid rgba(255,255,255,0.15)',
                                background: 'rgba(255,255,255,0.05)',
                                color: '#fff',
                              }}
                            />
                            <button
                              onClick={() => {
                                const outstanding = getOutstanding(loan)
                                setRepayInputs((m) => ({ ...m, [loan.id]: Math.floor(outstanding * 0.25) }))
                              }}
                              style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#6ba3bf' }}
                            >25%</button>
                            <button
                              onClick={() => {
                                const outstanding = getOutstanding(loan)
                                setRepayInputs((m) => ({ ...m, [loan.id]: Math.floor(outstanding * 0.5) }))
                              }}
                              style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#6ba3bf' }}
                            >50%</button>
                            <button
                              onClick={() => {
                                const outstanding = getOutstanding(loan)
                                const max = Math.min(outstanding, user.money)
                                setRepayInputs((m) => ({ ...m, [loan.id]: max }))
                              }}
                              style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#6ba3bf' }}
                            >Max</button>
                            <button
                              onClick={() => {
                                const outstanding = getOutstanding(loan)
                                setRepayInputs((m) => ({ ...m, [loan.id]: outstanding }))
                              }}
                              style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#6ba3bf' }}
                            >Full</button>
                          </div>
                          <div style={{ fontSize: '0.85rem' }}>
                            Remaining after payment: {' '}
                            <strong style={{ color: '#fff' }}>
                              ${Math.max(getOutstanding(loan) - Math.max(0, Math.floor(repayInputs[loan.id] ?? 0)), 0).toLocaleString()}
                            </strong>
                          </div>
                        </div>
                        <GradientButton
                          gradient="blue"
                          onClick={() => repayLoanPartial(loan.id)}
                          disabled={(repayInputs[loan.id] ?? 0) <= 0}
                        >
                          {`💵 Repay ${repayInputs[loan.id] ? '$' + Math.max(0, Math.floor(repayInputs[loan.id])).toLocaleString() : 'Amount'}`}
                        </GradientButton>
                        <div style={{ marginTop: '0.5rem' }}>
                          <GradientButton
                            gradient="purple"
                            onClick={() => repayLoan(loan.id)}
                            disabled={user.money < getOutstanding(loan)}
                          >
                            {user.money < getOutstanding(loan)
                              ? `Need $${(getOutstanding(loan) - user.money).toLocaleString()} more`
                              : `✅ Repay in Full (${getOutstanding(loan).toLocaleString()})`}
                          </GradientButton>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </GlassCard>
            )}

            {/* Take New Loan */}
            {!hasActiveLoan && (
              <GlassCard>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem',
                  color: '#4a9eff'
                }}>
                  💰 Request New Loan
                </h3>

                {/* Loan Amount Slider */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                  }}>
                    <label style={{ color: '#6ba3bf', fontWeight: '600' }}>
                      Loan Amount
                    </label>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22c55e' }}>
                      ${loanAmount.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={maxLoanAmount}
                    step="100"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="slider"
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    color: '#6ba3bf',
                    marginTop: '0.5rem'
                  }}>
                    <span>$0</span>
                    <span>${maxLoanAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Duration Selection */}
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{
                    display: 'block',
                    color: '#6ba3bf',
                    fontWeight: '600',
                    marginBottom: '1rem'
                  }}>
                    Repayment Period
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '0.75rem'
                  }}>
                    {[3, 7, 14, 30].map(days => (
                      <button
                        key={days}
                        onClick={() => setSelectedDuration(days)}
                        style={{
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: selectedDuration === days 
                            ? '2px solid #4a9eff' 
                            : '1px solid rgba(255, 255, 255, 0.1)',
                          background: selectedDuration === days 
                            ? 'rgba(74, 158, 255, 0.2)' 
                            : 'rgba(255, 255, 255, 0.05)',
                          color: selectedDuration === days ? '#4a9eff' : '#fff',
                          cursor: 'pointer',
                          fontWeight: '600',
                          transition: 'all 0.3s'
                        }}
                      >
                        {days} days
                      </button>
                    ))}
                  </div>
                </div>

                {/* Loan Summary */}
                {loanAmount > 0 && (
                  <div style={{
                    padding: '1.5rem',
                    background: 'rgba(74, 158, 255, 0.1)',
                    border: '1px solid rgba(74, 158, 255, 0.3)',
                    borderRadius: '12px',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#6ba3bf' }}>Loan Amount</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
                          ${loanAmount.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#6ba3bf' }}>Interest ({(interestRate * 100).toFixed(1)}%)</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                          ${(loanAmount * interestRate).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                      paddingTop: '1rem'
                    }}>
                      <div style={{ fontSize: '0.8rem', color: '#6ba3bf', marginBottom: '0.5rem' }}>
                        Total Repayment in {selectedDuration} days
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
                        ${totalOwed.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ width: '100%' }}>
                  <GradientButton
                    gradient="purple"
                    onClick={() => setShowConfirm(true)}
                    disabled={loanAmount === 0 || loanAmount > maxLoanAmount}
                  >
                    💰 Request Loan
                  </GradientButton>
                </div>
              </GlassCard>
            )}

            {/* Loan History */}
            {loanHistory.pastLoans.length > 0 && (
              <GlassCard>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  color: '#6ba3bf'
                }}>
                  📜 Loan History
                </h3>
                <div style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  {loanHistory.pastLoans.slice(-10).reverse().map(loan => (
                    <div
                      key={loan.id}
                      style={{
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderLeft: `3px solid ${loan.wasLate ? '#f59e0b' : '#22c55e'}`,
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{ fontWeight: 'bold', color: '#fff' }}>
                          ${loan.totalOwed.toLocaleString()}
                        </span>
                        <span style={{
                          color: loan.wasLate ? '#f59e0b' : '#22c55e',
                          fontWeight: '600'
                        }}>
                          {loan.wasLate ? '⚠️ Paid Late' : '✅ On Time'}
                        </span>
                      </div>
                      <div style={{ color: '#6ba3bf', fontSize: '0.8rem' }}>
                        Paid: {loan.paidAt?.toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{ maxWidth: '500px', width: '90%' }}>
            <GlassCard>
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: 'bold',
              color: '#ef4444',
              marginBottom: '1rem'
            }}>
              ⚠️ Confirm Loan
            </h2>
            <p style={{ marginBottom: '1.5rem', lineHeight: '1.6', color: '#6ba3bf' }}>
              You're about to borrow <strong style={{ color: '#22c55e' }}>${loanAmount.toLocaleString()}</strong> with {(interestRate * 100).toFixed(1)}% interest.
              You'll need to repay <strong style={{ color: '#ef4444' }}>${totalOwed.toLocaleString()}</strong> within {selectedDuration} days.
            </p>
            <p style={{
              marginBottom: '2rem',
              padding: '1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              fontSize: '0.9rem',
              color: '#ef4444',
              fontStyle: 'italic'
            }}>
              ⚠️ Warning: Failure to repay on time will damage your credit rating and increase future interest rates!
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <GradientButton
                  gradient="blue"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </GradientButton>
              </div>
              <div style={{ flex: 1 }}>
                <GradientButton
                  gradient="purple"
                  onClick={takeLoan}
                >
                  Confirm Loan
                </GradientButton>
              </div>
            </div>
            </GlassCard>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default LoanShark