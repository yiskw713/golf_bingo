// 厳密なエラーチェック
"use strict";

import { beginnerPannels, intermediatePannels, expertPannels } from "./pannel.js";

let clickedPannel = new Set();

// cookieの保存期間．1週間
const maxAge = 604800;

// cookieの追加
const setCookie = () => {
    // username
    const username = getUserName();

    // レベル
    const levelValue = getLevel();

    const clickedValue = JSON.stringify([...clickedPannel]);
    const usernameValue = JSON.stringify(username);

    document.cookie = "clicked=" + clickedValue + "; ";
    document.cookie = "username=" + usernameValue + "; ";
    document.cookie = "level=" + levelValue + "; ";
    document.cookie = "max-age=" + maxAge + "; ";
}

// cookieの削除
const deleteCookie = () => {
    document.cookie = "clicked=; max-age=0";
    document.cookie = "username=; max-age=0";
    document.cookie = "level=; max-age=0";
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

            if (cookie[0] === "username") {
                const val = JSON.parse(cookie[1]);
                const usernameInput = document.getElementById("usernameInput");
                usernameInput.value = val;
            }

            if (cookie[0] === "level") {
                const val = cookie[1];
                const elements = document.getElementsByName("radioButton");

                for (let i = 0; i < elements.length; i++) {
                    if (elements.item(i).value == val) {
                        elements.item(i).checked = true;
                    } else {
                        elements.item(i).checked = false;
                    }
                }
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


const getNumBingo = () => {
    let cnt = 0;
    let flag;
    // 縦
    for (let i = 0; i < 5; i++) {
        flag = true;
        for (let j = 0; j < 5; j++) {
            const pannelNum = i + j * 5;
            if (!clickedPannel.has(pannelNum)) {
                flag = false;
                break;
            }
        }
        if (flag) {
            cnt += 1;
        }
    }

    // 横
    for (let i = 0; i < 5; i++) {
        flag = true;
        for (let j = 0; j < 5; j++) {
            const pannelNum = i * 5 + j;
            if (!clickedPannel.has(pannelNum)) {
                flag = false;
                break;
            }
        }
        if (flag) {
            cnt += 1;
        }
    }

    // 斜め
    flag = true;
    const diagonal1 = [0, 6, 12, 18, 24];
    for (let pannelNum of diagonal1) {
        if (!clickedPannel.has(pannelNum)) {
            flag = false;
            break;
        }
    }
    if (flag) {
        cnt += 1;
    }

    flag = true;
    const diagonal2 = [4, 8, 12, 16, 20];
    for (let pannelNum of diagonal2) {
        if (!clickedPannel.has(pannelNum)) {
            flag = false;
            break;
        }
    }
    if (flag) {
        cnt += 1;
    }

    return cnt;
}

const getBingoScore = () => {
    const numBingo = getNumBingo();
    const numOpenPannels = clickedPannel.size;
    return 3 * numBingo + numOpenPannels;
}

const updateMessage = () => {
    const message = document.getElementById("message");
    const bingoScore = getBingoScore();
    message.innerText = bingoScore;
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
                updateMessage();
            } else {
                pannel.classList.add("clicked");
                clickedPannel.add(i);
                setCookie();
                updateMessage();
            }
        });
    }

    getCookie();
    createCard();
})


const getUserName = () => {
    const usernameInput = document.getElementById("usernameInput");
    return usernameInput.value;
}


// スコアに応じてビンゴカードを作成
const createCard = () => {
    const username = getUserName();
    const level = getLevel();

    // シード化
    const seed = getSeedFromUserName(username);

    const random = new Random(seed);
    const used = new Set();

    // 中央
    used.add();
    // パネルの作成
    let cnt = 0;
    while (cnt < 25) {
        let i;
        if (level == "beginner") {
            i = random.nextInt(0, beginnerPannels.length - 1);
        } else if (level == "intermediate") {
            i = random.nextInt(0, intermediatePannels.length - 1);
        } else {
            i = random.nextInt(0, expertPannels.length - 1);
        }

        if (used.has(i)) {
            continue;
        }

        if (level == "beginner") {
            makePannel(cnt, beginnerPannels[i]);
        } else if (level == "intermediate") {
            makePannel(cnt, intermediatePannels[i]);
        } else {
            makePannel(cnt, expertPannels[i]);
        }

        used.add(i);
        cnt++;
    }

    updateMessage();
}


const changeScore = () => {
    deleteCookie();
    clickedPannel = new Set();
    createCard();
    setCookie();
}

const getLevel = () => {
    const elements = document.getElementsByName('radioButton');
    const len = elements.length;
    let checkValue;

    for (let i = 0; i < len; i++) {
        if (elements.item(i).checked) {
            checkValue = elements.item(i).value;
        }
    }
    return checkValue;
}


const getSeedFromUserName = (username) => {
    let charCodeSum = 0;
    for (let i = 0; i < username.length; i++) {
        charCodeSum += username.charCodeAt(i);
    }
    return charCodeSum;
}

const button = document.getElementById("button");
button.addEventListener("click", changeScore);
