// 厳密なエラーチェック
"use strict";

import { beginnerPannels, intermediatePannels, expertPannels } from "./pannel.js";

// buttonがクリックされた時にキャラクターを選ぶ
const button = document.getElementById("button");
let clickedPannel = new Set();

// cookieの保存期間．1週間
const maxAge = 604800;

// cookieの追加
const setCookie = () => {
    const scoreInput = document.getElementById("scoreInput");
    const score = scoreInput.value;
    const clickedValue = JSON.stringify([...clickedPannel]);
    const scoreValue = JSON.stringify(score);

    document.cookie = "clicked=" + clickedValue + "; ";
    document.cookie = "score=" + scoreValue + "; ";
    document.cookie = "max-age=" + maxAge + "; ";
}

// cookieの削除
const deleteCookie = () => {
    document.cookie = "clicked=; max-age=0";
    document.cookie = "score=; max-age=0";
}

// cookieの取得
const getCookie = () => {
    const cookies = document.cookie;
    if (cookies !== "") {
        const cookieArr = cookies.split("; ");
        for (let i = 0; i < cookieArr.length; i++) {
            const cookie = cookieArr[i].split("=");
            if (cookie[0] === "clicked") {
                const arr = JSON.parse(cookie[1]);
                clickedPannel = new Set(arr);
            }

            if (cookie[0] === "score") {
                const val = JSON.parse(cookie[1]);
                const scoreInput = document.getElementById("scoreInput");
                scoreInput.value = val;
            }
        }
    }
}

// 乱数生成
// ref: https://sbfl.net/blog/2017/06/01/javascript-reproducible-random/
class Random {
    constructor(seed = 88675123) {
        this.x = 123456789;
        this.y = 362436069;
        this.z = 521288629;
        this.w = seed;
    }

    // XorShift
    next() {
        let t;

        t = this.x ^ (this.x << 11);
        this.x = this.y; this.y = this.z; this.z = this.w;
        return this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8));
    }

    // min以上max以下の乱数を生成する
    nextInt(min, max) {
        const r = Math.abs(this.next());
        return min + (r % (max + 1 - min));
    }
}

// i番目のcardの値を追加
// i=-1のときを含まない場合は空のキャラクタボックスを作成
const makePannel = (i, val) => {
    if (i == 12) {
        clickedPannel.add(i);
        return;
    }
    const pannel = document.getElementById("pannel" + i);
    pannel.textContent = val;

    if (clickedPannel.has(i)) {
        pannel.classList.add("clicked");
    } else {
        pannel.classList.remove("clicked");
    }
}

// 初期化
window.addEventListener("DOMContentLoaded", () => {
    // パネルに関数をセット
    for (let i = 0; i < 25; i++) {
        const pannel = document.getElementById("pannel" + i);

        if (i == 12) {
            pannel.classList.add("clicked");
            clickedPannel.add(12);
            continue;
        }

        // クリックしたら色をつける
        pannel.addEventListener("click", () => {
            if (pannel.classList.contains("clicked")) {
                pannel.classList.remove("clicked");
                clickedPannel.delete(i);
                setCookie();
            } else {
                pannel.classList.add("clicked");
                clickedPannel.add(i);
                setCookie();
            }
        });
    }

    getCookie();
    createCard();
})


// スコアに応じてビンゴカードを作成
const createCard = () => {
    const scoreInput = document.getElementById("scoreInput");
    const score = scoreInput.value;

    const random = new Random(score);
    const used = new Set();

    // 中央
    used.add();
    // パネルの作成
    let cnt = 0;
    while (cnt < 25) {
        const i = random.nextInt(0, beginnerPannels.length - 1);

        if (used.has(i)) {
            continue;
        }

        if (score <= 0 || score >= 130) {
            makePannel(cnt, beginnerPannels[i]);
        } else if (score >= 100) {
            makePannel(cnt, intermediatePannels[i]);
        } else {
            makePannel(cnt, expertPannels[i]);
        }

        used.add(i);
        cnt++;
    }
}


const changeScore = () => {
    deleteCookie();
    clickedPannel = new Set();
    createCard();
}

button.addEventListener("click", changeScore);