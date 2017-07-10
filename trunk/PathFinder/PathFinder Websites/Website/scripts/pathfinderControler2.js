(function () {
    function _PathFinderControler(object, pathFinderAlgorithm, options) {

        var privateParameters = {};
        //        var factorSize = 15;
        var MapBuilderInstance = null;
        var matrix = null;

        function _initializeClass(myDiv, options) {
            try {
                if (myDiv == null) return;
                if (options) for (var option in options) eval('privateParameters.' + option + '=options["' + option + '"]');
                if (privateParameters.Events) {
                    if (privateParameters.Events.onError == undefined) privateParameters.Events.onError = function (error) { };
                } else privateParameters.Events = {}; privateParameters.Events.onError = function (error) { alert(error); };

                MapBuilderInstance = new MapBuilder(myDiv, { Events: { Error: privateParameters.Events.onError } });

                privateParameters.Container = myDiv;
                privateParameters.Algorithm = pathFinderAlgorithm;

            } catch (Error) { privateParameters.Events.onError(Error); }
        };

        function _initialize(options) {

        };

        function _buildMap(map) {
            try {
                MapBuilderInstance.Redraw(privateParameters.Size);
                
            } catch (Error) { privateParameters.Events.onError(Error); }
        };

        function _play() {
            try {
                if ((privateParameters) && (privateParameters.Algorithm)) {
                    if ((privateParameters.Algorithm.isComplete) && (!(privateParameters.Algorithm.isComplete()))) {
                        if (privateParameters.Algorithm.Play) privateParameters.Algorithm.Play();
                    }
                }
            } catch (Error) { privateParameters.Events.onError(Error); }
        }

        function _setBackgroundGrid(map) {
            try {
                for (var h = 1; h <= map.Size.Height; h++) {
                    for (var w = 1; w <= map.Size.Width; w++) {
                        var gp = document.createElement('div');
                        gp.className = 'Block Clear';
                        gp.style.top = ((h - 1) * factorSize) + (h * 1) + 'px';
                        gp.style.left = ((w - 1) * factorSize) + (w * 1) + 'px';
                        gp.style.width = factorSize + 'px';
                        gp.style.height = factorSize + 'px';
                        mc.appendChild(gp);
                        matrix[h][w].grid = gp;q
                        if (matrix[h][w].type != 'block')
                            gp.innerHTML = 0;
                    }
                }

            } catch (Error) { privateParameters.Events.onError(Error); }
        };
        function _getBackgroundColor(value) {
            try {
                var iRGBConst;
                if (value < 6) {
                    iRGBConst = 155 / 5;
                    iG = 100 + (value * iRGBConst);
                    iR = 50;
                    iB = 0;
                } else if (value < 11) {
                    iRGBConst = 105 / 5;
                    value -= 5;
                    iG = 150 + (value * iRGBConst);
                    iR = 150 + (value * iRGBConst);
                    iB = 0;
                } else if (value < 20) {
                    iRGBConst = 105 / 5;
                    value -= 15;
                    iG = 150 + (value * iRGBConst);
                    iR = 75 + (value * iRGBConst);
                    iB = 0;
                } else if (value < 50) {
                    iRGBConst = 105 / 5;
                    value -= 45;
                    iG = 50 + (value * iRGBConst);
                    iR = 150 + (value * iRGBConst);
                    iB = 0;
                } else if (value < 75) {
                    iRGBConst = 105 / 5;
                    value -= 50;
                    iG = 50 + (value * iRGBConst);
                    iR = 150 + (value * iRGBConst);
                    iB = 0;
                } else if (value < 100) {
                    iRGBConst = 105 / 35;
                    value -= 75;
                    iG = 50 + (value * iRGBConst);
                    iR = 150 + (value * iRGBConst);
                    iB = 0;
                } else {
                    iRGBConst = 25 / 10;
                    value -= 10;
                    iG = 0;
                    iR = 155 + (value * iRGBConst);
                    iB = 0;
                }
                var r = (iR < 10) ? '0' + iR : ((iR < 16) ? '0' + iR.toString(16) : iR.toString(16));
                var g = (iG < 10) ? '0' + iG : ((iG < 16) ? '0' + iG.toString(16) : iG.toString(16));
                var b = (iB < 10) ? '0' + iB : ((iB < 16) ? '0' + iB.toString(16) : iB.toString(16));
                return ('#' + r + '' + g + '' + b);
                //return '#FF5000';
            } catch (Error) { privateParameters.Events.onError(Error); }
        }

        function _drawResult(x, y, count) {
            matrix[x][y].grid.innerHTML = (count) ? count : 0;
            matrix[x][y].grid.style.background = _getBackgroundColor((count) ? count : 0);
            _movePiece(privateParameters.moveElement, x, y);
        }

        function _movePiece(piece, cM, cN) {
            try {
                piece.style.top = (((cM * factorSize) + cM) - factorSize) + 'px';
                piece.style.left = (((cN * factorSize) + cN) - factorSize) + 'px';
            } catch (Error) { privateParameters.Events.onError(Error); }
        };

        _initializeClass(object, options);
        _initialize(options);


        //Public
        this.GetStadistic = function () {

        };
        this.Play = function () {
            _play();
            window.status = 'playing...';
        };
        this.Stop = function () {

        };
        this.Reset = function () {

        };
        this.DrawMap = function (map) {
            if (map) _buildMap(map);
        };

        this.UpdatePosition = function (x, y, count) {
            _drawResult(x, y, count);
        }
    }
    window.PathFinderControler = function (object, pathFinderAlgorithm, options) { return new _PathFinderControler(object, pathFinderAlgorithm, options); }
})();