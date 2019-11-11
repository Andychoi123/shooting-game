// 元素
const container = document.getElementById('game');

//获取canvas元素
const canvas = document.getElementById('canvas');

//调用canvas元素的getContext方法访问获取2d渲染上下文
const context = canvas.getContext('2d');
var loop_enemydraw;
var loop_keypress;

// 兼容定义requestAnimationFrame
window.requestAnimFrame =
window.requestAnimationFrame ||
window.webkitRequestAnimationFrame ||
window.mozRequestAnimationFrame ||
window.oRequestAnimationFrame ||
window.msRequestAnimationFrame ||
function (callback) {
  window.setTimeout(callback, 1000 / 60);
};

// 兼容定义cancelAnimationFrame
window.cancelAnimFrame =
window.cancelAnimationFrame ||
window.webkitCancelAnimationFrame ||
window.mozCancelAnimationFrame ||
window.oCancelAnimationFrame ||
window.msCancelAnimationFrame ||
function (id) {
  window.clearTimeout(id);
};

class Shape {
	constructor(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
}

class Plane extends Shape {
	constructor(x, y, width, height, planeStep) {
		super(x, y, width, height);
		this.planeStep = planeStep;
	}

	//创建Plane的draw方法
	draw() {
  		var _this = this;
  		var image = new Image();
  		image.src = 'img/plane.png';
  		image.onload = function() {
  		context.clearRect(10, 480, 700, 100);
  		context.drawImage(image, _this.x, _this.y, _this.width, _this.height);
    	};
	}
	//飞机的move方法
	move(direction, num) {
		if (num === undefined) {
    	var num = this.planeStep;
  		}
  		switch(direction) {
    		case 'left' : {
      			if (this.x < 30) {
      			return;
      		}
      			num = -num;
      			this.x += num;
    		}
    		break;
    		case 'right' : {
      			if (this.x > 610) {
      			return;
      		}
      			num = +num;
      			this.x += num;
    		}
    		break;
  		}
	}
}

class Bullet extends Shape {
	constructor(x, y,width, exists) {
		super(width);
		this.x = x + width/2;
  		this.y = y - 10;
		this.exists = exists;
	}
	//子弹y方向的数据更新
	update() {
		this.y -= 10;
	}
	//子弹的draw方法
	draw() {
		context.clearRect(this.x - 1, this.y, 5, 10);
    	context.beginPath();
    	context.moveTo(this.x, this.y);
    	context.lineTo(this.x, this.y - 10);
    	context.closePath();
    	context.lineWidth = 1;
    	context.strokeStyle = 'white';
    	context.stroke();
	}

	//检测与怪兽碰撞
	collisionDetect() {
		for(var j = GAME.enemyElements.length - 1; j>=0; j--) {
      		var eLeft = GAME.enemyElements[j].x;
      		var eRight = GAME.enemyElements[j].x + GAME.enemyElements[j].width;
      		var eTop = GAME.enemyElements[j].y;
      		var eBottom = GAME.enemyElements[j].y + GAME.enemyElements[j].height;
    		if (!((this.x + 1) < eLeft) && !(eRight < this.x) && !(this.y < eTop) && !(eBottom < (this.y - 10))) {
      			var countNum = document.querySelector('.num');
      			GAME.enemyElements[j].width = null;
      			GAME.enemyElements[j].height = null;
      			GAME.enemyElements.splice(j, 1);
      			GAME.count += 1;
      			countNum.textContent = GAME.count;

      			//如全部怪兽都消灭，进行初始化
      			if(countNum.textContent == 14) {
        			context.clearRect(0, 0, canvas.width, canvas.height);
        			cancelAnimFrame(loop_enemydraw);
        			cancelAnimFrame(loop_keypress);
        			GAME.count = 0;
        			GAME.plane = [];
        			GAME.bulletElements = [];
        			GAME.setStatus('all-success');
      			}
      	this.exists = false;
      	context.clearRect(this.x - 1, this.y - 10, 5, 20);

    		}
  		}
	}
}

class Enemy extends Shape {
	constructor(x, y, width, height) {
    super(x, y, width, height);
		this.velX = 2;
  	this.velY = 50;
  	this.direction = 'right';
	}

	//怪兽的draw方法
	draw() {
		var image = new Image();
  		var _this = this;
  		image.src = 'img/enemy.png';
  		image.onload = function() {
  			context.clearRect(_this.x, _this.y, 50, 50);
  			context.drawImage(image, _this.x, _this.y, _this.width, _this.height);
    	}
	}

	//怪兽x和y方向的move方法
	move(Sx, Sy) {
		this.x += Sx;
    	this.y += Sy;
	}

	//左右移动
	animate() {
		var dx = this.velX;
  		var _this = this;
  		if (_this.direction === 'right') {
    		_this.move(dx, 0);
  		} else if(_this.direction === 'left') {
    		_this.move(-dx, 0);
  		}
	}

	//向下移动
	down() {
		var dx = this.velX;
  		var dy = this.velY;
  		var _this = this;
  		if(_this.direction === 'right') {
    		_this.direction = 'left';
    		_this.move(-dx, dy);
  		}
  		else if(_this.direction === 'left') {
    		_this.direction = 'right';
    		_this.move(dx, dy);
  		}
	}

}

//怪兽移动的数据更新
  const update = ()=> {
    var enemies = GAME.enemyElements;
      var e = enemies.length;
      const isDown = (enemy, index, array) =>
        enemy.x > canvas.width - 30 - enemy.width || enemy.x < 30;

      //检测怪兽是否已到达两边界
      if (enemies.some(isDown)) {
        while (e--) {
            var enemy = enemies[e];
            //达到边界后向下移动
            enemy.down();
            context.clearRect(0, 0, 700, 480);
            //如果已到达最大高度后，游戏结束，并继续初始化
            if (enemy.y >= 480) {
                var gameInfoText = document.querySelector('.score');
                context.clearRect(0, 0, canvas.width, canvas.height);
                gameInfoText.textContent = GAME.count;
                cancelAnimFrame(loop_enemydraw);
                cancelAnimFrame(loop_keypress);
                enemies.splice(e, 1);
                GAME.plane = [];
                enemies = [];
                GAME.bulletElements =[];
                GAME.count = 0;
                GAME.setStatus('failed');
            }
          }
      } else {
          while (e--) {
            var enemy = enemies[e];
              enemy.animate();
          }
      }
  
    }

//控制怪兽和子弹的动画函数
const enemydraw = () => {
  update();
  for (let i = 0, len = GAME.enemyElements.length; i < len; i++)  {
      GAME.enemyElements[i].draw();
  }
  for (let g = GAME.bulletElements.length - 1; g >= 0; g--) {
    if (GAME.bulletElements[g].exists) {
      GAME.bulletElements[g].draw();
      GAME.bulletElements[g].update();
      GAME.bulletElements[g].collisionDetect();
    }
  }
  loop_enemydraw = requestAnimationFrame(enemydraw);
}


var GAME = {
  enemyElements : [],
  bulletElements : [],
  plane : [],
  count : 0,
  /**
   * 初始化函数,这个函数只执行一次
   * @param  {object} opts
   * @return {[type]}      [description]
   */
  init: function(opts) {
    this.status = 'start';
    this.bindEvent();
    console.log('hehe');
  },
  bindEvent: function() {
    var self = this;
    const playBtn = document.querySelector('.js-play');
    const rePlayBtn = document.querySelector('.js-replay');
    const gameCount = document.querySelector('.game-count');
    const successrePlayBtn = document.querySelector('.js-replay1');
    // 开始游戏按钮绑定
    playBtn.onclick = function() {
      self.play();
      gameCount.setAttribute('id', 'count');
      // console.log('p');
    }
      
    // 游戏结束后重新开始按钮绑定
    rePlayBtn.onclick = function() {
      self.enemyElements = [];
      self.bulletElements = [];
      self.play();
    }
    //通关后重新开始按钮绑定
    successrePlayBtn.onclick = function() {
      self.play();
      self.count = 0;
      // console.log('sp');

    }
  },
  /**
   * 游戏状态:playing 游戏中
   * failed 游戏失败
   */
  setStatus: function(status) {
    this.status = status;
    container.setAttribute('data-status', status);
  },
  play: function() {
    this.setStatus('playing');
    context.clearRect(0, 0, canvas.width, canvas.height);
    const countNum = document.querySelector('.num');
    countNum.textContent = this.count;
    var _this = this;
    var Plane1 = new Plane(320, 480, 60, 100, 10);

    for (var n = 0; n < 7; n++) {
      var initX = 35 + n*(50 + 10);
      _this.enemyElements.push(new Enemy(initX, 30, 50, 50));
    }
    this.plane.push(Plane1);
    for(let t =0, len= _this.enemyElements.length; t<len;t++) {
      _this.enemyElements[t].draw();
    };
    this.plane[0].draw();
    enemydraw();
    this.bindKeyEvent();
  },

  bindKeyEvent : function() {
    var self = this;
    var key_press = {};

    //全局监听键盘事件的keydown事件
    window.addEventListener('keydown', function (event) {
      if (!key_press[event.keyCode]) {
        key_press[event.keyCode] = false;  // 按下按键，即添加此按键名到数组中
      }
    })
    window.addEventListener('keyup', function (event) {
      delete key_press[event.keyCode];  // key up即删除，节省内存，提高遍历速度
    })
    function keyPress () {
      for (var key in key_press) {
        switch (key) {
          case '32': // 射击子弹
            if (key_press[key] === false) {
              var Bullet1 = new Bullet(self.plane[0].x, self.plane[0].y,self.plane[0].width, true);
              self.bulletElements.push(Bullet1);
              key_press[key] = true;  // 使得子弹按一次只能射击一次
            }
            break;
          case '37': // 移动飞机（向左）
            self.plane[0].move('left');
            self.plane[0].draw();
            break;
          case '39': // 移动飞机（向右）
            self.plane[0].move('right');
            self.plane[0].draw();
            break;
        }
      }
      loop_keypress = requestAnimFrame(keyPress);
    }
    keyPress();
  }
}

// 初始化
GAME.init();