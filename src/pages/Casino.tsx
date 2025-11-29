import { useState } from 'react'
import { useUser } from '../hooks/useUser'

// Helpers
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function round2(v: number) {
  return Math.round(v * 100) / 100
}

// Slot config
const SLOT_SYMBOLS = ['🍒', '🍋', '🔔', '⭐', '💎']
const SYMBOL_WEIGHTS: Record<string, number> = {
  '🍒': 45,
  '🍋': 30,
  '🔔': 15,
  '⭐': 8,
  '💎': 2,
}
const SLOT_PAYOUTS: Record<string, number> = {
  '🍒': 2,
  '🍋': 3,
  '🔔': 5,
  '⭐': 12,
  '💎': 50,
}

function weightedChoice(weights: Record<string, number>) {
  const entries = Object.entries(weights)
  const total = entries.reduce((s, [, w]) => s + w, 0)
  let r = Math.random() * total
  for (const [k, w] of entries) {
    if (r < w) return k
    r -= w
  }
  return entries[0][0]
}

// Card helpers
const SUITS = ['♠️', '♥️', '♣️', '♦️']
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

type Card = { rank: string; suit: string }

function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit })
    }
  }
  return deck.sort(() => Math.random() - 0.5)
}

function getCardValue(card: Card, currentTotal: number): number {
  if (card.rank === 'A') {
    return currentTotal + 11 > 21 ? 1 : 11
  }
  if (['J', 'Q', 'K'].includes(card.rank)) return 10
  return parseInt(card.rank)
}

function getHandTotal(cards: Card[]): number {
  let total = 0
  let aces = 0

  for (const card of cards) {
    if (card.rank === 'A') {
      aces++
      total += 11
    } else if (['J', 'Q', 'K'].includes(card.rank)) {
      total += 10
    } else {
      total += parseInt(card.rank)
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10
    aces--
  }

  return total
}

const Casino = () => {
  const { user, spendMoney, updateUser } = useUser()

  // General state
  const [activeGame, setActiveGame] = useState<string>('lobby')
  const [message, setMessage] = useState<string | null>(null)

  // Slot machine state
  const [isSpinning, setIsSpinning] = useState(false)
  const [reels, setReels] = useState<string[]>(['🎰', '🎰', '🎰'])

  // Roulette state
  const [rouletteSpinning, setRouletteSpinning] = useState(false)
  const [rouletteNumber, setRouletteNumber] = useState<number | null>(null)

  // Blackjack state
  const [bjDeck, setBjDeck] = useState<Card[]>([])
  const [bjPlayerHand, setBjPlayerHand] = useState<Card[]>([])
  const [bjDealerHand, setBjDealerHand] = useState<Card[]>([])
  const [bjGameState, setBjGameState] = useState<
    'betting' | 'playing' | 'dealer' | 'finished'
  >('betting')
  const [bjBet, setBjBet] = useState(0)
  const [bjDealerRevealed, setBjDealerRevealed] = useState(false)

  // High/Low state
  const [hlCurrentCard, setHlCurrentCard] = useState<Card | null>(null)
  const [hlBet, setHlBet] = useState(0)
  const [hlStreak, setHlStreak] = useState(0)
  const [hlPlaying, setHlPlaying] = useState(false)

  if (!user) return null

  // ============ COIN FLIP ============
  const COIN_HOUSE_EDGE_PCT = 5
  const coinPayoutMultiplier = (1 - COIN_HOUSE_EDGE_PCT / 100) * 2

  const handleCoinFlip = async (bet: number, guess: 'heads' | 'tails') => {
    if (bet <= 0) return setMessage('❌ Bet must be > 0')
    if (user.money < bet) return setMessage('❌ Not enough money to bet')

    try {
      const res = spendMoney(bet)
      const ok = res instanceof Promise ? await res : res
      if (!ok) return setMessage('❌ Failed to place bet')
    } catch (err) {
      console.error('spendMoney error:', err)
      return setMessage('❌ Error placing bet')
    }

    const flip = Math.random() < 0.5 ? 'heads' : 'tails'
    const win = flip === guess

    if (win) {
      const payout = round2(bet * coinPayoutMultiplier)
      updateUser({ money: round2(user.money + payout) })
      setMessage(`🎉 WIN! Landed on ${flip}. Won $${payout}!`)
    } else {
      setMessage(`💔 LOSE. Landed on ${flip}. Lost $${bet}.`)
    }
  }

  // ============ SLOT MACHINE ============
  const handleSpin = async (bet: number) => {
    if (bet <= 0) return setMessage('❌ Bet must be > 0')
    if (user.money < bet) return setMessage('❌ Not enough money to bet')
    if (isSpinning) return

    setIsSpinning(true)
    setMessage(null)

    try {
      const res = spendMoney(bet)
      const ok = res instanceof Promise ? await res : res
      if (!ok) {
        setIsSpinning(false)
        return setMessage('❌ Failed to place bet')
      }
    } catch (err) {
      console.error('spendMoney error:', err)
      setIsSpinning(false)
      return setMessage('❌ Error placing bet')
    }

    const spinSteps = 12
    for (let i = 0; i < spinSteps; i++) {
      setReels([
        weightedChoice(SYMBOL_WEIGHTS),
        weightedChoice(SYMBOL_WEIGHTS),
        weightedChoice(SYMBOL_WEIGHTS),
      ])
      await new Promise((res) => setTimeout(res, 80 + i * 20))
    }

    const r1 = weightedChoice(SYMBOL_WEIGHTS)
    const r2 = weightedChoice(SYMBOL_WEIGHTS)
    const r3 = weightedChoice(SYMBOL_WEIGHTS)
    setReels([r1, r2, r3])

    if (r1 === r2 && r2 === r3) {
      const symbol = r1
      const rawMultiplier = SLOT_PAYOUTS[symbol] || 0
      const houseEdge = 0.05
      const finalMultiplier = Math.max(0, rawMultiplier * (1 - houseEdge))
      const payout = round2(bet * finalMultiplier)

      updateUser({ money: round2(user.money + payout) })
      setMessage(`🎰 JACKPOT! ${symbol}${symbol}${symbol} Won $${payout}!`)
    } else {
      setMessage(`💔 No match. Better luck next time!`)
    }

    setIsSpinning(false)
  }

  // ============ ROULETTE ============
  const spinRoulette = async (
    bet: number,
    betType: string,
    betValue?: number
  ) => {
    if (bet <= 0) return setMessage('❌ Bet must be > 0')
    if (user.money < bet) return setMessage('❌ Not enough money to bet')
    if (rouletteSpinning) return

    setRouletteSpinning(true)
    setMessage('🎡 Spinning...')

    try {
      const res = spendMoney(bet)
      const ok = res instanceof Promise ? await res : res
      if (!ok) {
        setRouletteSpinning(false)
        return setMessage('❌ Failed to place bet')
      }
    } catch (err) {
      setRouletteSpinning(false)
      return setMessage('❌ Error placing bet')
    }

    // Animate spin
    for (let i = 0; i < 10; i++) {
      setRouletteNumber(randomInt(0, 36))
      await new Promise((res) => setTimeout(res, 100 + i * 30))
    }

    const number = randomInt(0, 36)
    setRouletteNumber(number)

    const isRed = [
      1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
    ].includes(number)
    const isBlack = number !== 0 && !isRed
    const isEven = number !== 0 && number % 2 === 0
    const isOdd = number !== 0 && !isEven

    let win = false
    let payout = 0

    if (betType === 'red' && isRed) {
      win = true
      payout = bet * 2
    } else if (betType === 'black' && isBlack) {
      win = true
      payout = bet * 2
    } else if (betType === 'even' && isEven) {
      win = true
      payout = bet * 2
    } else if (betType === 'odd' && isOdd) {
      win = true
      payout = bet * 2
    } else if (betType === 'number' && number === betValue) {
      win = true
      payout = bet * 35
    }

    if (win) {
      updateUser({ money: round2(user.money + payout) })
      setMessage(`🎉 WIN! Number ${number}. Won $${payout}!`)
    } else {
      setMessage(`💔 LOSE. Number ${number}. Lost $${bet}.`)
    }

    setRouletteSpinning(false)
  }

  // ============ BLACKJACK ============
  const startBlackjack = async (bet: number) => {
    if (bet <= 0) return setMessage('❌ Bet must be > 0')
    if (user.money < bet) return setMessage('❌ Not enough money to bet')

    try {
      const res = spendMoney(bet)
      const ok = res instanceof Promise ? await res : res
      if (!ok) return setMessage('❌ Failed to place bet')
    } catch (err) {
      return setMessage('❌ Error placing bet')
    }

    const deck = createDeck()
    const playerHand = [deck.pop()!, deck.pop()!]
    const dealerHand = [deck.pop()!, deck.pop()!]

    setBjDeck(deck)
    setBjPlayerHand(playerHand)
    setBjDealerHand(dealerHand)
    setBjBet(bet)
    setBjGameState('playing')
    setBjDealerRevealed(false)
    setMessage(null)

    // Check for player blackjack
    if (getHandTotal(playerHand) === 21) {
      setBjDealerRevealed(true)
      const dealerTotal = getHandTotal(dealerHand)
      if (dealerTotal === 21) {
        updateUser({ money: round2(user.money + bet) })
        setMessage('🤝 PUSH! Both have Blackjack!')
        setBjGameState('finished')
      } else {
        const payout = bet * 2.5
        updateUser({ money: round2(user.money + payout) })
        setMessage(`🃏 BLACKJACK! Won $${payout}!`)
        setBjGameState('finished')
      }
    }
  }

  const bjHit = () => {
    if (bjGameState !== 'playing') return

    const newCard = bjDeck.pop()!
    const newHand = [...bjPlayerHand, newCard]
    setBjPlayerHand(newHand)

    const total = getHandTotal(newHand)
    if (total > 21) {
      setMessage(`💔 BUST! You went over 21. Lost $${bjBet}.`)
      setBjGameState('finished')
      setBjDealerRevealed(true)
    }
  }

  const bjStand = () => {
    if (bjGameState !== 'playing') return

    setBjGameState('dealer')
    setBjDealerRevealed(true)

    // Dealer draws until 17+
    const dealerHand = [...bjDealerHand]
    let dealerTotal = getHandTotal(dealerHand)

    while (dealerTotal < 17) {
      const newCard = bjDeck.pop()!
      dealerHand.push(newCard)
      dealerTotal = getHandTotal(dealerHand)
    }

    setBjDealerHand(dealerHand)

    const playerTotal = getHandTotal(bjPlayerHand)

    if (dealerTotal > 21) {
      const payout = bjBet * 2
      updateUser({ money: round2(user.money + payout) })
      setMessage(`🎉 WIN! Dealer busted. Won $${payout}!`)
    } else if (playerTotal > dealerTotal) {
      const payout = bjBet * 2
      updateUser({ money: round2(user.money + payout) })
      setMessage(`🎉 WIN! ${playerTotal} vs ${dealerTotal}. Won $${payout}!`)
    } else if (playerTotal === dealerTotal) {
      updateUser({ money: round2(user.money + bjBet) })
      setMessage(`🤝 PUSH! Tie at ${playerTotal}.`)
    } else {
      setMessage(`💔 LOSE. Dealer wins ${dealerTotal} vs ${playerTotal}.`)
    }

    setBjGameState('finished')
  }

  // ============ HIGH/LOW CARD GAME ============
  const startHighLow = async (bet: number) => {
    if (bet <= 0) return setMessage('❌ Bet must be > 0')
    if (user.money < bet) return setMessage('❌ Not enough money to bet')

    try {
      const res = spendMoney(bet)
      const ok = res instanceof Promise ? await res : res
      if (!ok) return setMessage('❌ Failed to place bet')
    } catch (err) {
      return setMessage('❌ Error placing bet')
    }

    const deck = createDeck()
    const card = deck[0]
    setHlCurrentCard(card)
    setHlBet(bet)
    setHlStreak(0)
    setHlPlaying(true)
    setMessage('🃏 Guess: Higher or Lower?')
  }

  const guessHighLow = async (guess: 'higher' | 'lower') => {
    if (!hlCurrentCard || !hlPlaying) return

    const deck = createDeck()
    const nextCard = deck[0]

    const currentValue = RANKS.indexOf(hlCurrentCard.rank)
    const nextValue = RANKS.indexOf(nextCard.rank)

    let win = false
    if (guess === 'higher' && nextValue > currentValue) win = true
    if (guess === 'lower' && nextValue < currentValue) win = true
    if (nextValue === currentValue) win = true // tie = win

    if (win) {
      const newStreak = hlStreak + 1
      setHlStreak(newStreak)
      setHlCurrentCard(nextCard)
      setMessage(`✅ Correct! Streak: ${newStreak}. Keep going or Cash Out?`)
    } else {
      setMessage(
        `💔 Wrong! It was ${nextCard.rank}${nextCard.suit}. Lost $${hlBet}.`
      )
      setHlPlaying(false)
      setHlCurrentCard(null)
    }
  }

  const cashOutHighLow = () => {
    if (!hlPlaying) return

    const multiplier = 1 + hlStreak * 0.5 // 1.5x per correct guess
    const payout = round2(hlBet * multiplier)
    updateUser({ money: round2(user.money + payout) })
    setMessage(`💰 Cashed out! ${hlStreak} streak. Won $${payout}!`)
    setHlPlaying(false)
    setHlCurrentCard(null)
  }

  // ============ RENDER ============
  if (activeGame === 'lobby') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🎰 THE CASINO 🎰</h1>
          <p style={styles.subtitle}>
            Try your luck. House always wins... eventually.
          </p>
          <div style={styles.bankroll}>
            <span style={{ color: '#888' }}>BANKROLL:</span>
            <span
              style={{
                color: '#22c55e',
                fontSize: '28px',
                fontWeight: 'bold',
                marginLeft: '1rem',
              }}
            >
              ${round2(user.money).toLocaleString()}
            </span>
          </div>
        </div>

        <div style={styles.gameGrid}>
          <GameCard
            title="🪙 COIN FLIP"
            description="50/50 chance. Guess heads or tails."
            onClick={() => setActiveGame('coin')}
          />
          <GameCard
            title="🎰 SLOTS"
            description="Three reels. Match 3 symbols to win big."
            onClick={() => setActiveGame('slots')}
          />
          <GameCard
            title="🎡 ROULETTE"
            description="Bet on red, black, odd, even, or numbers."
            onClick={() => setActiveGame('roulette')}
          />
          <GameCard
            title="🃏 BLACKJACK"
            description="Beat the dealer. Get to 21 without busting."
            onClick={() => setActiveGame('blackjack')}
          />
          <GameCard
            title="📊 HIGH/LOW"
            description="Guess if next card is higher or lower. Build a streak!"
            onClick={() => setActiveGame('highlow')}
          />
          <GameCard
            title="🎲 DICE (Coming Soon)"
            description="Roll the dice. Multiple betting options."
            onClick={() => setMessage('🚧 Coming soon!')}
            disabled
          />
        </div>

        {message && <div style={styles.message}>{message}</div>}
      </div>
    )
  }

  // ============ COIN FLIP GAME ============
  if (activeGame === 'coin') {
    return (
      <div style={styles.container}>
        <button
          style={styles.backBtn}
          onClick={() => {
            setActiveGame('lobby')
            setMessage(null)
          }}
        >
          ← Back to Lobby
        </button>

        <h1 style={styles.gameTitle}>🪙 COIN FLIP</h1>
        <p style={styles.gameDesc}>
          Payout: {coinPayoutMultiplier.toFixed(2)}x (House Edge:{' '}
          {COIN_HOUSE_EDGE_PCT}%)
        </p>

        <div style={styles.gameArea}>
          <div style={styles.betGrid}>
            <BetButton
              label="$10 HEADS"
              onClick={() => handleCoinFlip(10, 'heads')}
            />
            <BetButton
              label="$10 TAILS"
              onClick={() => handleCoinFlip(10, 'tails')}
            />
            <BetButton
              label="$50 HEADS"
              onClick={() => handleCoinFlip(50, 'heads')}
            />
            <BetButton
              label="$50 TAILS"
              onClick={() => handleCoinFlip(50, 'tails')}
            />
            <BetButton
              label="$100 HEADS"
              onClick={() => handleCoinFlip(100, 'heads')}
            />
            <BetButton
              label="$100 TAILS"
              onClick={() => handleCoinFlip(100, 'tails')}
            />
          </div>
        </div>

        {message && <div style={styles.message}>{message}</div>}
      </div>
    )
  }

  // ============ SLOTS GAME ============
  if (activeGame === 'slots') {
    return (
      <div style={styles.container}>
        <button
          style={styles.backBtn}
          onClick={() => {
            setActiveGame('lobby')
            setMessage(null)
          }}
        >
          ← Back to Lobby
        </button>

        <h1 style={styles.gameTitle}>🎰 SLOT MACHINE</h1>
        <p style={styles.gameDesc}>Match 3 symbols to win!</p>

        <div style={styles.gameArea}>
          <div style={styles.slotMachine}>
            <div style={styles.reelBox}>{reels[0]}</div>
            <div style={styles.reelBox}>{reels[1]}</div>
            <div style={styles.reelBox}>{reels[2]}</div>
          </div>

          <div style={styles.betGrid}>
            <BetButton
              label="SPIN $5"
              onClick={() => handleSpin(5)}
              disabled={isSpinning}
            />
            <BetButton
              label="SPIN $20"
              onClick={() => handleSpin(20)}
              disabled={isSpinning}
            />
            <BetButton
              label="SPIN $50"
              onClick={() => handleSpin(50)}
              disabled={isSpinning}
            />
            <BetButton
              label="SPIN $100"
              onClick={() => handleSpin(100)}
              disabled={isSpinning}
            />
          </div>

          <div style={styles.payTable}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
              PAYTABLE:
            </div>
            {Object.entries(SLOT_PAYOUTS).map(([sym, mult]) => (
              <div key={sym}>
                {sym} {sym} {sym} = {mult}x
              </div>
            ))}
          </div>
        </div>

        {message && <div style={styles.message}>{message}</div>}
      </div>
    )
  }

  // ============ ROULETTE GAME ============
  if (activeGame === 'roulette') {
    const getNumberColor = (num: number) => {
      if (num === 0) return '#22c55e'
      const isRed = [
        1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
      ].includes(num)
      return isRed ? '#ef4444' : '#1a1a1a'
    }

    return (
      <div style={styles.container}>
        <button
          style={styles.backBtn}
          onClick={() => {
            setActiveGame('lobby')
            setMessage(null)
          }}
        >
          ← Back to Lobby
        </button>

        <h1 style={styles.gameTitle}>🎡 ROULETTE</h1>
        <p style={styles.gameDesc}>
          Bet on colors, odd/even, or specific numbers
        </p>

        <div style={styles.gameArea}>
          <div style={styles.rouletteWheel}>
            {rouletteNumber !== null && (
              <div
                style={{
                  fontSize: '96px',
                  fontWeight: 'bold',
                  color: getNumberColor(rouletteNumber),
                }}
              >
                {rouletteNumber}
              </div>
            )}
            {rouletteNumber === null && (
              <div style={{ fontSize: '48px', color: '#666' }}>?</div>
            )}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
              QUICK BETS (2x payout):
            </div>
            <div style={styles.betGrid}>
              <BetButton
                label="$10 RED"
                onClick={() => spinRoulette(10, 'red')}
                color="#ef4444"
                disabled={rouletteSpinning}
              />
              <BetButton
                label="$10 BLACK"
                onClick={() => spinRoulette(10, 'black')}
                color="#000"
                disabled={rouletteSpinning}
              />
              <BetButton
                label="$10 ODD"
                onClick={() => spinRoulette(10, 'odd')}
                disabled={rouletteSpinning}
              />
              <BetButton
                label="$10 EVEN"
                onClick={() => spinRoulette(10, 'even')}
                disabled={rouletteSpinning}
              />
              <BetButton
                label="$50 RED"
                onClick={() => spinRoulette(50, 'red')}
                color="#ef4444"
                disabled={rouletteSpinning}
              />
              <BetButton
                label="$50 BLACK"
                onClick={() => spinRoulette(50, 'black')}
                color="#000"
                disabled={rouletteSpinning}
              />
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
            Bet on specific numbers for 35x payout (coming soon)
          </div>
        </div>

        {message && <div style={styles.message}>{message}</div>}
      </div>
    )
  }

  // ============ BLACKJACK GAME ============
  if (activeGame === 'blackjack') {
    return (
      <div style={styles.container}>
        <button
          style={styles.backBtn}
          onClick={() => {
            setActiveGame('lobby')
            setMessage(null)
            setBjGameState('betting')
          }}
        >
          ← Back to Lobby
        </button>

        <h1 style={styles.gameTitle}>🃏 BLACKJACK</h1>
        <p style={styles.gameDesc}>
          Beat the dealer. Get to 21 without busting!
        </p>

        <div style={styles.gameArea}>
          {bjGameState === 'betting' && (
            <div style={styles.betGrid}>
              <BetButton label="BET $10" onClick={() => startBlackjack(10)} />
              <BetButton label="BET $25" onClick={() => startBlackjack(25)} />
              <BetButton label="BET $50" onClick={() => startBlackjack(50)} />
              <BetButton label="BET $100" onClick={() => startBlackjack(100)} />
            </div>
          )}

          {bjGameState !== 'betting' && (
            <div>
              {/* Dealer Hand */}
              <div style={styles.handContainer}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  DEALER {bjDealerRevealed && `(${getHandTotal(bjDealerHand)})`}
                </div>
                <div style={styles.cardRow}>
                  {bjDealerHand.map((card, idx) => (
                    <div key={idx} style={styles.card}>
                      {idx === 0 || bjDealerRevealed
                        ? `${card.rank}${card.suit}`
                        : '🂠'}
                    </div>
                  ))}
                </div>
              </div>

              {/* Player Hand */}
              <div style={styles.handContainer}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  YOU ({getHandTotal(bjPlayerHand)})
                </div>
                <div style={styles.cardRow}>
                  {bjPlayerHand.map((card, idx) => (
                    <div key={idx} style={styles.card}>
                      {card.rank}
                      {card.suit}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {bjGameState === 'playing' && (
                <div style={styles.betGrid}>
                  <BetButton label="HIT" onClick={bjHit} />
                  <BetButton label="STAND" onClick={bjStand} color="#22c55e" />
                </div>
              )}

              {bjGameState === 'finished' && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <BetButton
                    label="NEW GAME"
                    onClick={() => setBjGameState('betting')}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {message && <div style={styles.message}>{message}</div>}
      </div>
    )
  }

  // ============ HIGH/LOW GAME ============
  if (activeGame === 'highlow') {
    return (
      <div style={styles.container}>
        <button
          style={styles.backBtn}
          onClick={() => {
            setActiveGame('lobby')
            setMessage(null)
            setHlPlaying(false)
          }}
        >
          ← Back to Lobby
        </button>

        <h1 style={styles.gameTitle}>📊 HIGH / LOW</h1>
        <p style={styles.gameDesc}>
          Guess if the next card is higher or lower. Build a streak!
        </p>

        <div style={styles.gameArea}>
          {!hlPlaying && (
            <div style={styles.betGrid}>
              <BetButton label="BET $10" onClick={() => startHighLow(10)} />
              <BetButton label="BET $25" onClick={() => startHighLow(25)} />
              <BetButton label="BET $50" onClick={() => startHighLow(50)} />
              <BetButton label="BET $100" onClick={() => startHighLow(100)} />
            </div>
          )}

          {hlPlaying && hlCurrentCard && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div
                  style={{
                    fontSize: '14px',
                    color: '#888',
                    marginBottom: '1rem',
                  }}
                >
                  STREAK: {hlStreak} | POTENTIAL PAYOUT: $
                  {round2(hlBet * (1 + hlStreak * 0.5))}
                </div>
                <div style={styles.card}>
                  {hlCurrentCard.rank}
                  {hlCurrentCard.suit}
                </div>
              </div>

              <div style={styles.betGrid}>
                <BetButton
                  label="HIGHER ⬆️"
                  onClick={() => guessHighLow('higher')}
                  color="#22c55e"
                />
                <BetButton
                  label="LOWER ⬇️"
                  onClick={() => guessHighLow('lower')}
                  color="#ef4444"
                />
              </div>

              {hlStreak > 0 && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <BetButton
                    label="💰 CASH OUT"
                    onClick={cashOutHighLow}
                    color="#f59e0b"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {message && <div style={styles.message}>{message}</div>}
      </div>
    )
  }

  return null
}

// ============ REUSABLE COMPONENTS ============

const GameCard = ({
  title,
  description,
  onClick,
  disabled,
}: {
  title: string
  description: string
  onClick: () => void
  disabled?: boolean
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      border: '2px solid #333',
      borderRadius: '12px',
      padding: '2rem',
      textAlign: 'left',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s',
      opacity: disabled ? 0.5 : 1,
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.borderColor = '#f59e0b'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(245, 158, 11, 0.3)'
      }
    }}
    onMouseLeave={(e) => {
      if (!disabled) {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = '#333'
        e.currentTarget.style.boxShadow = 'none'
      }
    }}
  >
    <div
      style={{
        fontSize: '32px',
        marginBottom: '1rem',
      }}
    >
      {title}
    </div>
    <div
      style={{
        fontSize: '14px',
        color: '#888',
        lineHeight: '1.6',
      }}
    >
      {description}
    </div>
  </button>
)

const BetButton = ({
  label,
  onClick,
  disabled,
  color,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  color?: string
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      background: disabled ? '#1a1a1a' : color || '#f59e0b',
      border: 'none',
      borderRadius: '8px',
      padding: '1rem 1.5rem',
      color: '#fff',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s',
      opacity: disabled ? 0.5 : 1,
      textTransform: 'uppercase',
      letterSpacing: '1px',
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        e.currentTarget.style.transform = 'scale(1.05)'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)'
      }
    }}
    onMouseLeave={(e) => {
      if (!disabled) {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = 'none'
      }
    }}
  >
    {label}
  </button>
)

// ============ STYLES ============

const styles = {
  container: {
    minHeight: '100vh',
    color: '#fff',
    padding: '2rem',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  } as React.CSSProperties,

  header: {
    textAlign: 'center' as const,
    marginBottom: '3rem',
    paddingBottom: '2rem',
    borderBottom: '2px solid #333',
  } as React.CSSProperties,

  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    margin: '0 0 0.5rem 0',
    background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textTransform: 'uppercase' as const,
    letterSpacing: '4px',
  } as React.CSSProperties,

  subtitle: {
    fontSize: '16px',
    color: '#888',
    margin: '0 0 2rem 0',
  } as React.CSSProperties,

  bankroll: {
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  gameGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    maxWidth: '1200px',
    margin: '0 auto',
  } as React.CSSProperties,

  backBtn: {
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '0.75rem 1.5rem',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer',
    marginBottom: '2rem',
    transition: 'all 0.2s',
  } as React.CSSProperties,

  gameTitle: {
    fontSize: '42px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '0 0 0.5rem 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
  } as React.CSSProperties,

  gameDesc: {
    fontSize: '16px',
    color: '#888',
    textAlign: 'center' as const,
    marginBottom: '2rem',
  } as React.CSSProperties,

  gameArea: {
    maxWidth: '800px',
    margin: '0 auto',
    background: '#1a1a1a',
    border: '2px solid #333',
    borderRadius: '12px',
    padding: '2rem',
  } as React.CSSProperties,

  betGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '1rem',
  } as React.CSSProperties,

  slotMachine: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '2rem',
  } as React.CSSProperties,

  reelBox: {
    width: '120px',
    height: '120px',
    background: '#000',
    border: '3px solid #f59e0b',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '64px',
    boxShadow: '0 0 20px rgba(245, 158, 11, 0.5)',
  } as React.CSSProperties,

  payTable: {
    marginTop: '2rem',
    padding: '1rem',
    background: '#0a0a0a',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#888',
    textAlign: 'center' as const,
  } as React.CSSProperties,

  rouletteWheel: {
    width: '200px',
    height: '200px',
    margin: '0 auto 2rem',
    background: '#0a0a0a',
    border: '4px solid #f59e0b',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 30px rgba(245, 158, 11, 0.5)',
  } as React.CSSProperties,

  handContainer: {
    marginBottom: '2rem',
    textAlign: 'center' as const,
  } as React.CSSProperties,

  cardRow: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,

  card: {
    background: '#fff',
    color: '#000',
    padding: '1.5rem',
    borderRadius: '8px',
    fontSize: '32px',
    fontWeight: 'bold',
    minWidth: '80px',
    textAlign: 'center' as const,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  } as React.CSSProperties,

  message: {
    marginTop: '2rem',
    padding: '1.5rem',
    background: '#0a0a0a',
    border: '2px solid #f59e0b',
    borderRadius: '12px',
    textAlign: 'center' as const,
    fontSize: '18px',
    fontWeight: 'bold',
    maxWidth: '800px',
    margin: '2rem auto 0',
  } as React.CSSProperties,
}

export default Casino
