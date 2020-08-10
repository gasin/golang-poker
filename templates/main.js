const Hand = {
    HighCard: 0,
    OnePair: 1,
    TwoPair: 2,
    ThreeCard: 3,
    Straight: 4,
    Flush: 5,
    FullHouse: 6,
    FourCard: 7,
    StraightFlush: 8
};

const createCardElement = (card) => {
    const elem = document.createElement('div');
    elem.classList.add('card');

    const cardLabel = document.createElement('div');
    cardLabel.innerText = `${card.suit || ''}${card.label}`;
    elem.appendChild(cardLabel);

    return elem;
};

const judgeHand = ([...cards]) => {
    console.log(cards);
    const suits = cards.map(function(item){ return item.suit; });
    const nums = cards.map(function(item){ return item.rank; });
    console.log(nums);
    nums.sort();
    var flush = true;
    for (let i = 1; i < suits.length; i++) {
        if (suits[i] !== suits[0]) {
            flush = false;
        }
    }
    var straight = true;
    for (let i = 1; i < nums.length; i++) {
        if (nums[i] !== nums[i-1]+1) {
            straight = false;
        }
    }
    if (nums[0] === 2 && nums[1] === 3 && nums[2] === 4 && nums[3] === 5 && nums[4] === 14) {
        straight = true;
    }
    if (straight && flush) {
        return Hand.StraightFlush;
    }
    if (straight) {
        return Hand.Straight;
    }
    if (flush) {
        return Hand.Flush;
    }
    if (nums[0] === nums[3] || nums[1] === nums[4]) {
        return Hand.FourCard;
    }
    if (nums[0] === nums[2]) {
        return (nums[3] === nums[4] ? Hand.FullHouse : Hand.ThreeCard);
    }
    if (nums[2] === nums[4]) {
        return (nums[0] === nums[1] ? Hand.FullHouse : Hand.ThreeCard);
    }
    var pairCount = 0;
    for (let i = 1; i < nums.length; i++) {
        if (nums[i] === nums[i-1]) {
            pairCount++;
        }
    }
    if (pairCount === 2) {
        return Hand.TwoPair;
    }
    if (pairCount === 1) {
        return Hand.OnePair;
    }
    return Hand.HighCard;
};

(function startGame() {
    const deck = new Deck();
    var cards = deck.deal(5);

    const nameInput = document.createElement("input");
    nameInput.setAttribute("type", "text");
    nameInput.setAttribute("maxlength", "10");
    nameInput.setAttribute("value", "アカウント名");

    const sendButton = document.createElement("BUTTON");
    sendButton.innerHTML = "SEND";

    const refleshButton = document.createElement("BUTTON");
    refleshButton.innerHTML = "REFLESH";

    const backButton = document.createElement("BUTTON");
    backButton.innerHTML = "TOP";

    function render(renderTarget, state) {
        renderTarget.innerText = ''; // 描画内容をクリア

        const container = document.createElement('div');
        container.classList.add('card-group');
        renderTarget.appendChild(container);

        for(const card of state.cardList) {
            const cardElem = createCardElement(card);
            container.appendChild(cardElem);
        }
        document.body.appendChild(nameInput);
        document.body.appendChild(sendButton);
        document.body.appendChild(refleshButton);
        document.body.appendChild(backButton);
    };
    render(document.body, {cardList: cards});

    backButton.onclick = function() {
        window.location.href = "http://153.120.93.222:3000/";
    }

    refleshButton.onclick = function() {
        console.log("reflesh");
        cards = deck.deal(5);
        render(document.body, {cardList: cards});
    }

    sendButton.onclick = function() {
        console.log("send data");
        console.log(nameInput.value);

        const state = {cardList: cards};

        var data = "{";
        for(const [index, card] of state.cardList.entries()) {
            if (index !== 0) {
                data += ",";
            }
            data = data + '"card' + String(index+1) + '":' + String(suitIndex[card.suit]*100+card.rank);
        }
        data += ',"name":"' + nameInput.value + '"';
        data += ',"hand":' + judgeHand(cards);
        data += "}";

        const xhr = new XMLHttpRequest();

        xhr.open('POST', 'http://153.120.93.222:3000/post');
        xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');

        console.log(data);
        xhr.send(data);

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log(xhr.responseText);
            }
        }
    }
})();
