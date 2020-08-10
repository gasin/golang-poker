const shuffle = ([...array]) => {
    console.log(array);
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i+1));
        [array[i], array[j]] = [array[j], array[i]]
    }
    console.log(array);
    return array;
}

const Suit = {
    SPADE: '♠',
    CLUB: '♣',
    DIAMOND: '♦',
    HEART: '♥',
};

const suitList = [
    Suit.SPADE,
    Suit.CLUB,
    Suit.DIAMOND,
    Suit.HEART
];

const suitIndex = { '♠': 0, '♣': 1, '♦': 2, '♥': 3};

const cardList = [
    {rank: 2, label: '2' },
    {rank: 3, label: '3' },
    {rank: 4, label: '4' },
    {rank: 5, label: '5' },
    {rank: 6, label: '6' },
    {rank: 7, label: '7' },
    {rank: 8, label: '8' },
    {rank: 9, label: '9' },
    {rank: 10, label: '10' },
    {rank: 11, label: 'J' },
    {rank: 12, label: 'Q' },
    {rank: 13, label: 'K' },
    {rank: 14, label: 'A' }
];

// 各スートごとに2からAまで作成する
const deckBase = 
    suitList
        .map((suit) => cardList.map((card) => ({suit, ...card})))
        .flat()
        .map(Object.freeze);

// 山札クラス
class Deck {
    constructor(options = {}) {
        this._deck = [...deckBase];
    }

    init() {
        console.log("init");
    }

    deal(num) {
        return shuffle(this._deck).slice(0, num);
    }
}
