enchant();
enchant.Sound.enabledInMobileSafari = true;

window.onload = function () {
	var core = new Core(400, 500);
	core.fps = 30;
	var url = "http://nenzirou.html.xdomain.jp/Explosion/index.html";
	url = encodeURI(url);
	var mSumTime = 0;
	var sumMoney = 0;
	// セーブデータロード
	var cookies = document.cookie;
	var cookiesArray = cookies.split(";");
	for (var i = 0; i < cookiesArray.length; i++) {
		cArray = cookiesArray[i].split("=");
		cArray[0] = cArray[0].trim();
		if (cArray[0] == "ex_money") sumMoney = Number(cArray[1]);
		if (cArray[0] == "ex_time") mSumTime = Number(cArray[1]);
	}
	var p;
	var ownFood = [224];
	for (var i = 0; i < 224; i++) ownFood[i] = false;
	//プリロード
	var ASSETS = {
		"se_explo": 'sound/explo.mp3',
		"se_button": 'sound/button.mp3',
		"se_cheer": 'sound/cheer.mp3',
		"se_heart": 'sound/heart.mp3',
		"se_money": 'sound/money.mp3',
		"se_food": 'sound/food.mp3',
		"se_bomb": 'sound/bomb.mp3',
		"se_illust": 'sound/illust.mp3',
		"img_title": 'img/title.jpg',
		"img_button": 'img/button.png',
		"img_swc": 'img/switch.png',
		"img_bomb": 'img/bomb.png',
		"img_explosion": 'img/explosion.png',
		"img_background": 'img/background.jpg',
		"img_black": 'img/black.png',
		"img_food": 'img/food.png',
		"img_UI1": 'img/UI1.png',
		"bgm": 'sound/bgm.mp3',
	};
	core.preload(ASSETS);
	////////////////////////////////////////////////クラス・関数////////////////////////////////////////////////////
	//オブジェクトが従うクラス
	var Obj = Class.create(Sprite, {
		initialize: function (width, height, x, y, scene, img) {
			Sprite.call(this, width, height);
			this.x = x;
			this.y = y;
			if (img != null) this.image = core.assets[img];
			this.hp = 1;
			scene.addChild(this);
		},
		move: function (dx, dy) {
			this.x += dx;
			this.y += dy;
		},
	});

	//食べもの
	var Food = Class.create(Obj, {
		initialize: function (x, y, scene) {
			Obj.call(this, 32, 32, x, y, scene, "img_food");
			var id = Math.floor(221.99 * Math.random());
			this.frame = id;
			var dx = 1;
			var dy = 0;
			var r = Math.random();
			var direction;
			if (Math.random() < 0.5) direction = 1;
			else direction = -1;
			if (direction == -1) this.x = 432;
			var mode = this.frame % 5;
			//if (mode != 3) scene.removeChild(this);
			this.scale(1.7, 1.7);
			this.addEventListener("enterframe", function () {
				if (state == 1) {
					if (mode == 0) dx = 2;
					else if (mode == 1) {
						dy = Math.sin(Math.PI / (10 + 40 * r) * this.age);
						dx = 3;
					} else if (mode == 2) {
						dx = 8 * Math.sin(Math.PI / (5 + 5 * r) * this.age) + 5;
						dy = 8 * Math.cos(Math.PI / (5 + 5 * r) * this.age);
					}
					else if (mode == 3) dx += 0.4;
					else if (mode == 4) dx = 15;
					this.x += dx * direction;
					this.y += dy * direction;
					if (this.x > 500 || this.x < -100) scene.removeChild(this);
				}
			});
			this.addEventListener("touchstart", function () {
				if (state == 1) {
					if (p < 1) core.assets['se_food'].clone().play();
					else core.assets['se_bomb'].clone().play();
					ownFood[id] = true;
					scene.removeChild(this);
					var text = new Text(this.x, this.y, 15, "#ff3030", scene);//ポイント
					text.text = "+" + (2 + mode * 2) / 10 + "%";
					if (p >= 1) text.text = "0%";
					p += (2 + mode * 2) / 1000;
					text.onenterframe = function () {
						text.y--;
						text.opacity = 1 - (this.age / 100);
						if (this.age == 100) scene.removeChild(text);
					}
				}
			});
		}
	});

	// 爆弾
	var Bomb = Class.create(Obj, {
		initialize: function (x, y, scene) {
			Obj.call(this, 32, 32, x, y, scene, "img_bomb");
			var id = Math.floor(4.99 * Math.random());
			this.frame = 1 + id * 6;
			var dx = 3;
			var dy = 0;
			var direction;
			if (Math.random() < 0.5) direction = 1;
			else direction = -1;
			if (direction == -1) this.x = 432;
			this.scale(0.8, 0.8);
			this.addEventListener("enterframe", function () {
				if (state == 1) {
					this.x += dx * direction;
					this.y += dy * direction;
					if (this.x > 500 || this.x < -100) scene.removeChild(this);
				}
			});
			this.ontouchend = function () {
				if (state == 1) {
					core.assets['se_bomb'].clone().play();
					ownFood[0] = true;
					p -= 1 / 1000;
					scene.removeChild(this);
					var text = new Text(this.x, this.y, 15, "#30ffff", scene);//ポイント
					text.text = "-" + 1 / 10 + "%";
					text.onenterframe = function () {
						text.y--;
						text.opacity = 1 - (this.age / 100);
						if (this.age == 100) scene.removeChild(text);
					}
				}
			};
		}
	});

	//ボタン
	var Button = Class.create(Obj, {
		initialize: function (x, y, scene) {
			Obj.call(this, 120, 60, x, y, scene, "img_button");
		}
	});

	// 爆発エフェクト
	var explosion = Class.create(Obj, {
		initialize: function (x, y, scene) {
			Obj.call(this, 128, 128, x, y, scene, "img_explosion");
			this.scale(4, 4);
			this.frame = 8;
			core.assets['se_explo'].clone().play();
			this.addEventListener("enterframe", function () {
				if (this.age % 2 == 1) this.frame++;
				if (this.frame >= 24 || state != 3) scene.removeChild(this);
			});
		}
	});

	//テキスト
	var Text = Class.create(Label, {
		initialize: function (x, y, font, color, scene) {
			Label.call(this);
			this.font = font + "px Meiryo";
			this.color = color;
			this.width = 400;
			this.moveTo(x, y);
			scene.addChild(this);
		}
	})

	//BGM
	var Bgm = enchant.Class.create({
		initialize: function () {
			this.data = null;
			this.isPlay = false;//プレイの状態フラグ
			this.isPuase = false;
		},
		//BGM用音楽ファイルのセット
		set: function (data) {
			this.data = data;
		},
		//再生(再生のみに使う)
		play: function () {
			this.data.play();
			this.isPlay = true;
			if (this.data.src != undefined) {//srcプロパティを持っている場合
				this.data.src.loop = true;
			}
		},
		//ループ再生(必ずループ内に記述すること) PCでのループ再生で使う
		loop: function () {
			if (this.isPlay == true && this.data.src == undefined) {//再生中でsrcプロパティを持っていない場合
				this.data.play();
				this.isPuase = false;//ポーズ画面から戻った場合は自動的に再生を再開させるため
			} else if (this.isPuase) {//srcあり場合でポーズ画面から戻ったとき用
				this.data.play();
				this.data.src.loop = true;//ポーズするとfalseになるっぽい(確認はしていない)
				this.isPuase = false;
			}
		},
		//再生停止(曲を入れ替える前は,必ずstop()させる)
		stop: function () {
			if (this.data != null) {
				if (this.isPuase) {
					this.isPlay = false;
					this.isPuase = false;
					this.data.currentTime = 0;
				} else if (this.isPlay) {
					this.data.stop();
					this.isPlay = false;
				}
			}
		},
		//一時停止（ポーズ画面などの一時的な画面の切り替え時に音を止めたいときのみ使う）
		pause: function () {
			if (this.data != null) {
				this.data.pause();
				this.isPuase = true;
			}
		}
	});

	core.onload = function () {
		state = 99;
		var useP = 50;
		var swcFlag;
		var cnt = 0;
		var cnt2 = 0;
		var money = 100;
		var time = 30;
		var sumTime = 0;
		var swcCnt = 0;

		//スタート画面
		S_Start = new Scene();
		core.pushScene(S_Start);
		new Obj(400, 500, 0, 0, S_Start, "img_title");
		var T_Text = new Text(0, 15, 42, "#fabf13", S_Start);
		T_Text.text = "運命の爆弾";
		T_Text.textAlign = "center";
		var objFood = [224];

		//手に入れた食料を表示
		for (var i = 0; i < 224; i++) {
			objFood[i] = new Obj(32, 32, 23 * (i % 17), 60 + 23 * Math.floor(i / 17), S_Start, "img_food");
			objFood[i].scale(0.7, 0.7);
			if (ownFood[i]) objFood[i].frame = i;
		}

		//startボタン
		var B_Go = new Button(10, 430, S_Start);
		B_Go.frame = 0;
		B_Go.ontouchend = function () {
			state = 0;
			core.popScene();
			core.pushScene(S_MAIN);
			core.assets['se_button'].clone().play();
		};

		// 遊び方
		var illust = new Bgm();
		illust.set(core.assets["se_illust"]);
		// 遊び方ボタン
		var B_Play = new Button(140, 430, S_Start);
		B_Play.frame = 5;
		B_Play.ontouchend = function () {
			state = 4;
			core.popScene();
			core.pushScene(S_MAIN);
			core.assets['se_button'].clone().play();
			illust.play();
		};

		//ツイートボタン
		var S_Tweet = new Button(270, 430, S_Start);
		S_Tweet.frame = 2;
		S_Tweet.ontouchend = function () {
			core.assets['se_button'].clone().play();
			if (sumTime == 0) window.open("http://twitter.com/intent/tweet?text=【運命の爆弾】確実に生き残るか、運に頼って生き残るか、決めるのはあなた次第だ！運と命を賭けて、お金を大量に稼ごう！！" + url + "&hashtags=ゲーム,スマホゲー,フリーゲーム");
			else window.open("http://twitter.com/intent/tweet?text=【運命の爆弾】最長で" + mSumTime.toFixed(1) + "秒生き残り、累計" + sumMoney + "円のお金を稼いだ！！あなたも運と命を懸けた一発逆転の運試しはいかが？" + url + "&hashtags=ゲーム,スマホゲー,フリーゲーム");
		};

		// テキスト
		var SM_Text = new Text(0, 400, 20, "#ffd900", S_Start);//お金
		SM_Text.textAlign = "center";
		SM_Text.text = "口座:" + sumMoney + "円";
		var MST_Text = new Text(0, 370, 20, "#ff0000", S_Start);//最高生存時間
		MST_Text.textAlign = "center";
		MST_Text.text = "最長記録:" + mSumTime.toFixed(1) + "秒";

		//ゲーム画面
		var S_MAIN = new Scene();

		//BGM
		var stageBGM = new Bgm();
		stageBGM.set(core.assets["bgm"]);


		// 背景
		new Obj(400, 400, 0, 0, S_MAIN, "img_background");
		var black = new Obj(400, 500, 0, 0, S_MAIN, "img_black");

		// UI
		UI1 = new Obj(400, 100, 0, 450, S_MAIN, "img_UI1");
		UI1.scale(1, 2);
		UI2 = new Obj(400, 100, 0, -30, S_MAIN, "img_UI1");
		UI2.scale(1, 0.3);

		//テキスト
		var M_Text = new Text(5, 5, 28, "#ffd900", S_MAIN);//お金
		var P_Text = new Text(30, 445, 30, "#303030", S_MAIN);//確率
		var T_Text = new Text(160, 445, 30, "#303030", S_MAIN);//制限時間
		var ST_Text = new Text(160, 480, 15, "#303030", S_MAIN);//累計時間
		var text1 = new Text(10, 410, 30, "#c03030", S_MAIN);//成功確率
		var text2 = new Text(150, 410, 30, "#30c030", S_MAIN);//制限時間
		var text3 = new Text(90, 480, 15, "#30c0c0", S_MAIN);//累計時間
		P_Text.text = "90%";
		M_Text.text = "114514円";
		T_Text.text = "30秒";
		ST_Text.text = "810秒";
		text1.text = "成功確率";
		text2.text = "制限時間";
		text3.text = "累計時間";
		var cText = ["やったね！", "よかったね", "やるわね", "こいつ、できる…！", "やりますねぇ！", "君に敬意を表するッ！", "うれしいね", "やったじゃん", "流石だね", "うまいね", "頑張ったね", "えらいね",
			"すばらしいね", "エクセレントだね", "ビューティフォーだね", "コアラだね", "伝説だね", "武勇伝だね", "ゴリラだね", "ケツだね", "天才かな？", "ノーベル賞平和賞受賞", "もう総理大臣になれ",
			"まだいける！", "絶対にあきらめないッ！", "迫真だね", "選ばれし者じゃん", "ゴリラ", "楽しいね", "前田敦子", "頑張ってるね", "やりおる", "プロじゃん", "素敵やん", "俺は好きだよ",
			"輝いてるね", "君は今一番輝いてる", "青春だね", "神だね", "達人だね", "鬼だね", "優等生だね", "ありがとう", "お疲れ様です", "鍛わってるね", "やってんなぁ！", "気合入ってるね", "かっこいいね",
			"君かわいいね", "てかLINEやってる？", "結構なお手前で。", "エロいね", "夏目漱石だね", "うまそうだね", "腹減ってきたな", "手羽先だね", "早寝早起きは大事だね", "無人島に何持ってく？俺は納豆",
			"1億円もらったら何する？俺はゴリラ", "見えないものを見ようとして望遠鏡を担いでそうだね", "はい、ゲームのカードを落としてす、しまったのですが！", "達人だね", "世界レベルだね", "マッチョだね",
			"もっと熱くなれよ！", "成田空港じゃん", "一生の思い出だね", "ハワイ行きてえな", "勝ち組だね", "うーん、100点！w", "適切だね", "なかなかやるじゃない", "パプアニューギニア", "布団が吹っ飛んだね",
			"やればできるじゃん", "俺は信じてたよ", "マジかっこいい", "憧れちゃうね", "陽キャだね", "間違いないね", "救世主だね", "パラダイスだね", "金持ちだね", "人類の希望だね", "こだわりが見えるね",
			"後ろに誰かいますよ", "よく見たらイケメンじゃん//", "高学歴かよ", "こいつぁグレートですよ", "世界一だね", "ブラジルだね", "神がかってるね"];

		// 中断ボタン
		var stop = new Button(300, -15, S_MAIN);
		stop.scale(0.7, 0.7);
		stop.frame = 3;
		stop.ontouchend = function () {
			if (state == 1) {
				state = 5;
				this.frame = 9;
				stageBGM.data.volume = 0;
			} else if (state == 5) {
				state = 1;
				this.frame = 3;
				stageBGM.data.volume = 0.8;
			}
			if (state == 4) {
				illust.stop();
				core.popScene();
				core.pushScene(S_Start);
			}
		};

		// 自爆スイッチ
		var swc = new Obj(400, 400, 130, 250, S_MAIN, "img_swc");
		swc.scale(0.2, 0.2);
		swc.ontouchend = function () {
			if (state == 1) swcFlag = true;
		};

		//////////////////////////////////////////////メインループ/////////////////////////////////////////////////////////////
		core.onenterframe = function () {
			if (state == 0) {//初期化処理
				stageBGM.play();
				stageBGM.data.volume = 0.8;
				state = 1;
				cnt = 0;
				cnt2 = 0;
				time = 30;
				p = 0.9;
				swcFlag = false;
				swc.frame = 0;
				black.opacity = 0;
				sumTime = 0;
				money = 100;
			} else if (state == 1) {
				stageBGM.loop();
				cnt++;
				if (cnt % 4 == 0) new Food(-32, 340 * Math.random() + 30, S_MAIN);
				if (cnt % 30 == 0) new Bomb(-32, 340 * Math.random() + 30, S_MAIN);
				if (p < 0) p = 0;
				if (p > 1) p = 1;
				useP = p * 100;
				if (useP < 0) useP = 0;
				time -= 1 / 30;
				sumTime += 1 / 30;
				if (time < 0) {
					time = 0;
					swcFlag = true;
				}
				P_Text.text = useP.toFixed(1) + "%";
				M_Text.text = money + "円";
				T_Text.text = time.toFixed(1) + "秒";
				ST_Text.text = sumTime.toFixed(1) + "秒";
				if (swcFlag) {
					swcCnt++;
					state = 2;
					swc.frame = 1;
					black.opacity = 0.5;
					core.assets['se_heart'].clone().play();
					stageBGM.data.volume = 0;
				}
			} else if (state == 2) {
				cnt2++;
				if (cnt2 > 60) {
					if (useP / 100 >= Math.random()) {
						state = 1;
						black.opacity = 0;
						swc.frame = 0;
						money *= 2;
						if (30 - 1.2 * swcCnt < 5) secCnt--;
						time = 30 - 1.2 * swcCnt;
						cnt2 = 0;
						swcFlag = false;
						var dP = 0.3 * Math.random() * (1 - time / (30 - swcCnt)) + Math.random() * 0.2
						p -= dP;
						core.assets['se_cheer'].clone().play();
						core.assets['se_money'].clone().play();
						// ありがたいお言葉
						var C_Text = new Text(0, 200, 30, "#ea5504", S_MAIN);//累計時間
						C_Text.textAlign = "center";
						C_Text.text = cText[Math.floor(cText.length * Math.random())];
						C_Text.onenterframe = function () {
							this.opacity -= 0.001 * this.age;
							if (this.opacity <= 0) S_MAIN.removeChild(this);
						}
						// 上昇金額
						var UC_Text = new Text(0, 170, 40, "#ffd900", S_MAIN);//累計時間
						UC_Text.textAlign = "center";
						UC_Text.text = "+" + money / 2 + "円";
						UC_Text.onenterframe = function () {
							this.opacity -= 0.001 * this.age;
							this.y -= 1;
							if (this.opacity <= 0) S_MAIN.removeChild(this);
						}
						// マイナス成功確率
						var DP_Text = new Text(15, 400, 30, "#30ffff", S_MAIN);//累計時間
						DP_Text.text = "-" + (dP * 100).toFixed(1) + "%";
						DP_Text.onenterframe = function () {
							this.opacity -= 0.001 * this.age;
							this.y -= 1;
							if (this.opacity <= 0) S_MAIN.removeChild(this);
						}
						stageBGM.data.volume = 0.8;
					} else state = 3;
				}
			} else if (state == 3) {
				stageBGM.data.volume = 0;
				black.opacity -= 0.01;
				new explosion(Math.random() * 400, Math.random() * 500, S_MAIN);
				if (black.opacity <= 0) state = 10;
			} else if (state == 4) {
				black.opacity = 0;
				if (illust.data.duration <= illust.data.currentTime) {
					illust.stop();
					core.popScene();
					core.pushScene(S_Start);
				}
			} else if (state == 10) {
				sumMoney += money;
				SM_Text.text = "口座:" + sumMoney + "円";
				if (mSumTime < sumTime) mSumTime = sumTime;
				MST_Text.text = "最長記録:" + mSumTime.toFixed(1) + "秒";
				document.cookie = "ex_time=" + mSumTime;
				document.cookie = "ex_money=" + sumMoney;
				state = 99;
				stageBGM.stop();
				for (var i = 0; i < 224; i++) {
					if (ownFood[i]) objFood[i].frame = i;
				}
				core.popScene();
				core.pushScene(S_Start);
			}
		}
		//////////////////////////////////////////////メインループ終了////////////////////////////////////////////////////////////
	};
	core.start();
};

