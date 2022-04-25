class BoggleGame{

    constructor(boardId, secs = 60){
        this.secs = secs;
        this.showTimer()
        this.score = 0;
        this.words = new Set();
        this.board = $("#" + boardId);
        this.timer = setInterval(this.tick.bind(this), 1000);

        $(".add-word", this.board).on("submit", this.handleSubmit.bind(this));
    }

showWord(word){
    $(".words", this.board).append($("<li>", { text: word }));
}

showMessage(msg, cls){
    $(".msg", this.board)
        .text(msg)
        .removeClass()
        .addClass(`msg ${cls}`);
}

showScore(){
    $(".score", this.board).text(this.score);
}

async handleSubmit(evt) {
    evt.preventDefault();

    const $word = $(".word", this.board);

    let word = $word.val();
    if (!word) return;

    if(this.words.has(word)){
        this.showMessage(`Already found ${word}`, "err");
        return;
    }

    const res = await axios.get("/check-word", { params: { word: word }});
    if(res.data.result === "not-word"){
        this.showMessage(`${word} is not valid english`, "err");

    } else if (res.data.result === "not-on-board"){
        this.showMessage(`${word} not on board`, "err");

    } else {
        this.showWord(word);
        this.score += word.length;
        this.showScore();
        this.words.add(word);
        this.showMessage(`Added: ${word}`, "ok")
    }
    $word.val("").focus();
}

showTimer(){
    $(".timer", this.board).text(this.secs);
}

async tick() {
    this.secs -= 1;
    this.showTimer();

    if(this.secs === 0){
        clearInterval(this.timer);
        await this.scoreGame();
    }
}

async scoreGame(){
    $(".add-word", this.board).hide();
    const resp = await axios.post("/post-score", { score: this.score });
    if(resp.data.brokeRecord){
        this.showMessage(`new record: ${this.score}`, "ok");
    } else {
        this.showMessage(`final score: ${this.score}`, "ok")
    }
}
}
