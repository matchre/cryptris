function KeyColumn(director, type, squareNumber, container, boxOption, msgColumn) {
    this.type = type;
    this.boxOption = boxOption;
    this.squareNumber = squareNumber;
    this.container = container;
    this.isActive = true;
    this.pb = null;
    this.msgColumn = msgColumn;
    this.keyInMove = false;
    this.keyFirstMove = false;
    this.pathContinue = false;

    this.column = new CAAT.Foundation.ActorContainer();
    this.container.addChild(this.column);

    if (this.squareNumber === 0) {
        this.column.setSize(this.boxOption.SQUARE_WIDTH, this.boxOption.SQUARE_HEIGHT / 2);
    }

    this.gradient = null;
    this.blurGradient = null;

    this.computeGradient = function() {
        if (this.type != COLUMN_TYPE_3) {
            this.gradient = director.ctx.createLinearGradient(0, 0, this.boxOption.SQUARE_WIDTH, 0);
            this.gradient.addColorStop(0, this.boxOption.ColorLeft[this.type]);
            this.gradient.addColorStop(1, this.boxOption.Color[this.type]);
        } else {
            this.gradient = null;
        }
    }

    this.computeBlurGradient = function() {
        if (this.type != COLUMN_TYPE_3) {
            this.blurGradient = director.ctx.createLinearGradient(0, 0, this.boxOption.SQUARE_WIDTH, 0);
            this.blurGradient.addColorStop(0, this.boxOption.blurColorLeft[this.type]);
            this.blurGradient.addColorStop(1, this.boxOption.blurColor[this.type]);
        } else {
            this.blurGradient = null;
        }
    }

    this.computeBlurGradient();
    this.computeGradient();

    this.redraw = function(x, y) {
        y = typeof y !== 'undefined' ? y : this.boxOption.BORDER_HEIGHT;
        this.column.setLocation(x, y);

        this.column.setSize(this.boxOption.COLUMN_WIDTH, this.squareNumber * (this.boxOption.SQUARE_HEIGHT + this.boxOption.SPACE_HEIGHT) - this.boxOption.SPACE_HEIGHT);

        var object = this;
        this.column.paint = function(director, time) {
            if (this.isCached()) {
                CAAT.Foundation.ActorContainer.prototype.paint.call(this, director, time);
                return;
            }
             
            var ctx = director.ctx;
            var x = 1.5;
            
            // Custom paint method.
            for (var i = 0; i < object.squareNumber; ++i) {

                var y = 0.5 + i * (object.boxOption.SQUARE_HEIGHT + object.boxOption.SPACE_HEIGHT);

                ctx.lineWidth = 1;
                ctx.strokeStyle = object.boxOption.StrokeColor[object.type];
                ctx.strokeRect(x, y, object.boxOption.SQUARE_WIDTH, object.boxOption.SQUARE_HEIGHT);
                ctx.fillStyle = object.gradient;
                ctx.fillRect(x + 0.5, y + 0.5, object.boxOption.SQUARE_WIDTH - 1, object.boxOption.SQUARE_HEIGHT - 1);
            }
        }
    }

    this.firstRedraw = function(x) {
        y = -1 * this.boxOption.maxKeyNumber * (this.boxOption.SQUARE_HEIGHT + this.boxOption.SPACE_HEIGHT) + (this.boxOption.BORDER_HEIGHT + this.boxOption.SPACE_HEIGHT);
        this.column.setLocation(x, y);

        this.column.setSize(this.boxOption.COLUMN_WIDTH, this.squareNumber * (this.boxOption.SQUARE_HEIGHT + this.boxOption.SPACE_HEIGHT) - this.boxOption.SPACE_HEIGHT);

        var object = this;
        this.column.paint = function(director, time) {
            if (this.isCached()) {
                CAAT.Foundation.ActorContainer.prototype.paint.call(this, director, time);
                return;
            }
             
            var ctx = director.ctx;
            var x = 1.5;
            
            // Custom paint method.
            for (var i = 0; i < object.squareNumber; ++i) {

                var y = 0.5 + i * (object.boxOption.SQUARE_HEIGHT + object.boxOption.SPACE_HEIGHT);

                if (object.column.y + y >= object.boxOption.BORDER_HEIGHT) {
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = object.boxOption.StrokeColor[object.type];
                    ctx.strokeRect(x, y, object.boxOption.SQUARE_WIDTH, object.boxOption.SQUARE_HEIGHT);
                    ctx.fillStyle = object.gradient;
                    ctx.fillRect(x + 0.5, y + 0.5, object.boxOption.SQUARE_WIDTH - 1, object.boxOption.SQUARE_HEIGHT - 1);
                } else if (object.column.y + y >= object.boxOption.BORDER_HEIGHT - object.boxOption.SQUARE_HEIGHT) {

                    var diffNewHeight = 0;
                    while (object.column.y + y + diffNewHeight <= object.boxOption.BORDER_HEIGHT) {
                        ++diffNewHeight;
                    }
                    var newHeight = object.boxOption.SQUARE_HEIGHT - diffNewHeight;
                    y = y + diffNewHeight;

                    ctx.lineWidth = 1;
                    ctx.strokeStyle = object.boxOption.StrokeColor[object.type];
                    ctx.strokeRect(x, y, object.boxOption.SQUARE_WIDTH, newHeight);
                    ctx.fillStyle = object.gradient;
                    ctx.fillRect(x + 0.5, y + 0.5, object.boxOption.SQUARE_WIDTH - 1, newHeight - 1);
                }
            }
        }
    }

    this.firstMove = function() {
        this.keyFirstMove = true;
        var path =  new CAAT.LinearPath().setInitialPosition(this.column.x, this.column.y).setFinalPosition(this.column.x, this.boxOption.BORDER_HEIGHT);
        var pb = new CAAT.PathBehavior().setPath(path).setFrameTime(this.container.time, getSecondString("ft", 250)).setCycle(false);

        var object = this;
        var behaviorListener = {'behaviorExpired' : function(behavior, time, actor) { object.keyFirstMove = false; }, 'behaviorApplied' : null};

        pb.addListener(behaviorListener);
        this.column.addBehavior(pb);
    }

    this.stopMove = function() {
        if (this.pb !== null) {
            this.pb.setOutOfFrameTime();
        }
    }

    this.changeType = function() {
        if (this.type === COLUMN_TYPE_1) {
            this.type = COLUMN_TYPE_2;
        } else if (this.type === COLUMN_TYPE_2) {
            this.type = COLUMN_TYPE_1;
        }

        this.computeGradient();
        this.redraw();
    }

    this.setInactive = function() {
        this.isActive = false;
    }

    this.clean = function() {
        this.squareNumber = 0;
        this.redraw();
    }

    this.keyDown = function() {

        if (this.type !== COLUMN_TYPE_3) {
            this.keyInMove = true;
            var path =  new CAAT.LinearPath().setInitialPosition(this.column.x, this.column.y).setFinalPosition(this.column.x, this.column.y + this.container.height);
            this.pb = new CAAT.PathBehavior().setPath(path).setFrameTime(this.column.time, getSecondString("t", 1750)).setCycle(false);
            this.column.addBehavior(this.pb);
            this.boxOption.objectsInMove.push(true);
        }
    }

    var object = this;
    this.myTimer = director.createTimer(this.container.time, Number.MAX_VALUE, null,
        function(time, ttime, timerTask) {

            if (object.keyFirstMove === false && object.keyInMove === true && object.isActive === true) {

                var msgColumn = object.msgColumn.column;

                var keyColumn = object.column;

                if (keyColumn.y + keyColumn.height > msgColumn.y - 2 * object.boxOption.SPACE_HEIGHT) {

                    object.stopMove();

                    keyColumn.setLocation(msgColumn.x, msgColumn.y - keyColumn.height - object.boxOption.SPACE_HEIGHT);
                    object.msgColumn.mergeColumns(object);


                    if (object.pathContinue === true) {
                        object.pathContinue = false;
                        object.keyDown();
                    } else {
                        object.clean();
                        object.setInactive();
                    }

                    object.boxOption.objectsInMove.splice(0, 1);
                    if (object.boxOption.objectsInMove.length === 0) {
                        object.boxOption.keyNeedToUpdate = true;
                    }
                }
                keyColumn = null;
            }
        }
    );

}

function getSecondString(key, default_) {
  if (default_==null) default_=""; 
  key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
  var qs = regex.exec(window.location.href);
  if(qs == null)
    return default_;
  else
    return qs[1];
}

function Key(keyInfo, keyLength, msgColumn, container, director, boxOption, player) {
    this.player = player;
    this.type = KEY_TYPE_NORMAL;
    this.length = keyLength;
    this.columnList = [];
    this.msgColumn = msgColumn;
    this.container = container;
    this.boxOption = boxOption;
    this.keyInMove = false;
    this.keyFirstMove = false;

    this.keyInfo = keyInfo;
    this.normalKey = [];
    for (var i = 0; i < this.keyInfo['normal_key'].length; ++i) {
        this.normalKey.push(this.keyInfo['normal_key'][i]);
    }
    this.reverseKey = [];
    for (var i = 0; i < this.keyInfo['reverse_key'].length; ++i) {
        this.reverseKey.push(this.keyInfo['reverse_key'][i]);
    }
    this.number = [];
    for (var i = 0; i < this.keyInfo['number'].length; ++i) {
        this.number.push(this.keyInfo['number'][i]);
    }

    this.createKey = function() {
        for (var i = 0; i < this.columnList.length; ++i) {
            this.container.removeChild(this.columnList[i].column);
            this.columnList[i].myTimer.cancel();
            this.columnList[i].myTimer = null;
            /*this.columnList[i].deleteObject();
            this.columnList[i].deleteObject = null;*/
            this.columnList[i] = null;
        }
        //this.columnList = null;
        this.columnList = [];
        this.keyInMove = false;
        this.keyFirstMove = true;

        this.boxOption.maxKeyNumber = 0;
        for (var i = 0; i < this.length; ++i) {
            if (this.number[i] > this.boxOption.maxKeyNumber) {
                this.boxOption.maxKeyNumber = this.number[i];
            }
            if (this.type === KEY_TYPE_NORMAL) {
                this.columnList.push(new KeyColumn(director, this.normalKey[i], this.number[i], container, this.boxOption, this.msgColumn.columnList[i]));
            } else if (this.type === KEY_TYPE_REVERSE) {
                this.columnList.push(new KeyColumn(director, this.reverseKey[i], this.number[i], container, this.boxOption, this.msgColumn.columnList[i]));
            }
        }

        this.firstRedraw();
        return this;
    }

    this.firstRedraw = function() {
        for (var i = 0; i < this.columnList.length; ++i) {
            this.columnList[i].firstRedraw(this.boxOption.BORDER_WIDTH + i * (this.boxOption.COLUMN_WIDTH + this.boxOption.SPACE_WIDTH));
        }
        for (var i = 0; i < this.columnList.length; ++i) {
            this.columnList[i].firstMove();
        }
    }

    this.redraw = function() {
        for (var i = 0; i < this.columnList.length; ++i) {
            this.columnList[i].redraw(this.boxOption.BORDER_WIDTH + i * (this.boxOption.COLUMN_WIDTH + this.boxOption.SPACE_WIDTH));
        }
    }

    this.changeKeyType = function() {
        if (this.keyFirstMove === false && this.keyInMove === false && this.msgColumn.resolved === false) {
            if (this.type === KEY_TYPE_NORMAL) {
                this.type = KEY_TYPE_REVERSE;
            } else {
                this.type = KEY_TYPE_NORMAL;
            }

            for (var i = 0; i < object.columnList.length; ++i) {
                object.columnList[i].changeType();
                object.redraw();
            }
        }
    }

    this.rotateLeft = function() {
        if (this.keyFirstMove === false && this.keyInMove === false && this.msgColumn.resolved === false) {
            this.columnList.push(this.columnList[0]);
            this.columnList.splice(0, 1);

            this.normalKey.push(this.normalKey[0]);
            this.normalKey.splice(0,1);

            this.reverseKey.push(this.reverseKey[0]);
            this.reverseKey.splice(0,1);

            this.number.push(this.number[0]);
            this.number.splice(0, 1);

            this.reAssignColumns();
            this.redraw();
        }
    }

    this.rotateRight = function() {
        if (this.keyFirstMove === false && this.keyInMove === false && this.msgColumn.resolved === false) {
            this.columnList.splice(0, 0, this.columnList[this.columnList.length - 1]);
            this.columnList.splice(this.columnList.length - 1, 1);

            this.normalKey.splice(0, 0, this.normalKey[this.normalKey.length - 1]);
            this.normalKey.splice(this.normalKey.length - 1, 1);

            this.reverseKey.splice(0, 0, this.reverseKey[this.reverseKey.length - 1]);
            this.reverseKey.splice(this.reverseKey.length - 1, 1);

            this.number.splice(0, 0, this.number[this.number.length - 1]);
            this.number.splice(this.number.length - 1, 1);

            this.reAssignColumns();
            this.redraw();
        }
    }

    this.reAssignColumns = function() {
        for (var i = 0; i < this.columnList.length; ++i) {
            this.columnList[i].msgColumn = this.msgColumn.columnList[i];
        }
    }

    this.keyDown = function() {
        if (this.keyFirstMove === false && this.keyInMove === false && this.msgColumn.resolved === false) {
            this.keyInMove = true;
            for (var i = 0; i < this.columnList.length; ++i) {
                this.columnList[i].keyDown();
            }
        }
    }

    var object = this;

    director.createTimer(this.container.time, Number.MAX_VALUE, null,
        function(time, ttime, timerTask) {
            if (object.keyFirstMove === true) {
                var newKeyFirstMove = false;
                for (var i = 0; i < object.columnList.length; ++i) {
                    if (object.columnList[i].keyFirstMove === true) {
                        newKeyFirstMove = true;
                    }
                }
                object.keyFirstMove = newKeyFirstMove;
            }


            if (object.keyFirstMove === false && object.boxOption.keyNeedToUpdate === true) {
                object.boxOption.keyNeedToUpdate = false;
                var needToUpdateAgain = false;
                for (var k = 0; k < object.msgColumn.columnList.length; ++k) {
                    if (object.msgColumn.columnList[k].blockToDestroy !== null) {
                        if (object.msgColumn.columnList[k].blockToDestroy.isVisible === false) {
                            object.msgColumn.columnList[k].container.removeChild(object.msgColumn.columnList[k].blockToDestroy.column);
                            object.msgColumn.columnList[k].blockToDestroy = null;
                        } else {
                            needToUpdateAgain = true;
                        }
                    }
                    object.msgColumn.columnList[k].blurSquareNumber = 0;
                    object.msgColumn.columnList[k].keySquareNumber = 0;
                }

                if (needToUpdateAgain === true) {
                    object.boxOption.keyNeedToUpdate = true;
                } else {
                    object.msgColumn.redraw();
                    object.createKey();
                    object.msgColumn.isResolved();
                }
            }
        }
    );


    if (this.player === true) {
        CAAT.registerKeyListener(function(key) {
            if (key.getKeyCode() === CAAT.Keys.LEFT && key.getAction() === 'down') {
                object.rotateLeft();
            }
            if (key.getKeyCode() === CAAT.Keys.RIGHT && key.getAction() === 'down') {
                object.rotateRight();
            }
            if ((key.getKeyCode() === CAAT.Keys.UP || key.getKeyCode() === 32) && key.getAction() === 'down') {
                object.changeKeyType();
            }
            if (key.getKeyCode() === CAAT.Keys.DOWN && key.getAction() === 'up') {
                object.keyDown();
            }
        });
    }
}
