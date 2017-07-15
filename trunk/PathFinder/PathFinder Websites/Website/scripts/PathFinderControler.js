//try
//{
//    
//}
//catch (Error) { this.Events.onError(Error); }

//BLOCK_TYPES =
//{
//    Clear: { ID: ++btIndex, ClassName: blockPartialClassName + "Clear" }
//    , End: { ID: ++btIndex, ClassName: blockPartialClassName + "End" }
//    , Start: { ID: ++btIndex, ClassName: blockPartialClassName + "Start" }
//    , Wall: { ID: ++btIndex, ClassName: blockPartialClassName + "Wall" }
//};

(function () {
    try {
        //#region PRIVATE_ATTRIBUTES_OBJECT

        var PRIVATE_ATTRIBUTES_OBJECT = function (options) {
            try {
                /* 
                    The variable "MyReference" is used inside the methods to keep the reference
                to "this" object.
                */
                var MyReference = this;

                for (var opt in options)
                    MyReference[opt] = options[opt];

                //#region Set optional options default values

                //if (!MyReference.Algorithms)
//                    MyReference.Algorithms = [];
                if (!MyReference.EditionMode)
                    MyReference.EditionMode = {};
                if (!MyReference.EditionMode.Enabled)
                    MyReference.EditionMode.Enabled = false;
                if (!MyReference.Events)
                    MyReference.Events = {};
                if (!MyReference.Events.BlockClick)
                    MyReference.Events.BlockClick = [];
                if (!MyReference.Events.BlockMouseDown)
                    MyReference.Events.BlockMouseDown = [];
                if (!MyReference.Events.BlockMouseOver)
                    MyReference.Events.BlockMouseOver = [];
                if (!MyReference.Events.BlockMouseUp)
                    MyReference.Events.BlockMouseUp = [];
                if (!MyReference.Events.Error)
                    MyReference.Events.Error = [function (error) { window.status = error.Message; } ];
                if(!MyReference.FactorSize)
                    MyReference.FactorSize = null;

                MyReference.MatrixSource = new MapMatrix(MyReference.MatrixSource);

                //#endregion

                //#region Attributes

                /* 
                    The property "MyReference.Public" will be used to set the public stuff 
                to the real instance.
                */
                MyReference.Public = {};

                //#region Properties

                MyReference.Algorithms = [];
                MyReference.AlgorithmsMoving = {};
                MyReference.Container = null;
                MyReference.CurrentBlockTypeToPaint = window.BLOCK_TYPES.Names.Wall; //Current Position Status Type to Paint
                MyReference.EditionMode.IsMouseDown = false;
                MyReference.MatrixJSON = null;
                MyReference.Finder = { X: null, Y: null};

                //#endregion

                //#region Methods

                MyReference.Initialize = function(container) {
                    try
                    {
                        MyReference.Container = container;

                        if (MyReference.EditionMode.Enabled)
                        {
                            MyReference.Events.BlockClick.push(MyReference.Block_EditionMode_Click);
                            MyReference.Events.BlockMouseDown.push(MyReference.Block_EditionMode_MouseDown);
                            MyReference.Events.BlockMouseOver.push(MyReference.Block_EditionMode_MouseOver);
                            MyReference.Events.BlockMouseUp.push(MyReference.Block_EditionMode_MouseUp);
                        }
                        else
                        {
                            MyReference.Finder.X = 0;
                            MyReference.Finder.Y = 0;
                        }

                        if(MyReference.MatrixSource)
                        {
                            MyReference.MatrixJSON = MyReference.MatrixSource.GetMatrixJSON();

                            MyReference.Redraw(MyReference.MatrixJSON);
                        }
                    }
                    catch (Error) { MyReference.Events.onError(Error); }
                };
                MyReference.Public.AddAlgorithm =
                MyReference.AddAlgorithm = function(algorithm) {
                    try
                    {
                        MyReference.Algorithms.push(algorithm);

                        algorithm.SetControler(MyReference);
                    }
                    catch (Error) { MyReference.Events.onError(Error); }
                };
                MyReference.Public.AskForPermissionToMove =
                MyReference.AskForPermissionToMove = function (finder) { 
                    //Wait for some time to call move to do it more real.
                    setTimeout(
                        function () {
                            var finderId = finder.GetId();

                            if (!MyReference.AlgorithmsMoving[finderId]) {
                                MyReference.AlgorithmsMoving[finderId] = finder;

                                var result = finder.Move();

                                if (result)
                                    MyReference.UpdatePosition(result.position);

                                delete MyReference.AlgorithmsMoving[finderId];

                                finder.Play();
                            }
                            else {
                                finder.Play();
                            }
                        },
                        100
                    );
                };
                MyReference.FillBarLabel = function(barLabel, count, horizontalMode) {
                    try {
                        var labelBaseClassName = "";

                        if (!horizontalMode)
                        {
                            labelBaseClassName += " LabelVertical";
                        }
                        else
                        {
                            labelBaseClassName += " LabelHorizontal";

                            var labelEmptyLeft = document.createElement("div");
                            labelEmptyLeft.className = labelBaseClassName;
                            labelEmptyLeft.innerHTML = "&nbsp";

                            if(MyReference.FactorSize != null)
                            {
                                labelEmptyLeft.style.width =
                                labelEmptyLeft.style.height = MyReference.FactorSize.toString() + "px";
                            }

                            barLabel.appendChild(labelEmptyLeft);
                        }


                        var label;
                        
                        for (var labelIndex = 1; labelIndex <= count; labelIndex++) {
                            label = document.createElement("div");
                            label.className = labelBaseClassName;
                            label.innerHTML = labelIndex;

                            if(MyReference.FactorSize != null)
                            {
                                label.style.width =
                                label.style.height = MyReference.FactorSize.toString() + "px";
                            }

                            barLabel.appendChild(label);
                        }

                        if (label)
                            label.className = labelBaseClassName + " LabelLast";

                        if (horizontalMode) {
                            var labelEmptyRight = document.createElement("div");
                            labelEmptyRight.className = labelBaseClassName;
                            labelEmptyRight.innerHTML = "&nbsp";

                            if(MyReference.FactorSize != null)
                            {
                                labelEmptyRight.style.width =
                                labelEmptyRight.style.height = MyReference.FactorSize.toString() + "px";
                            }

                            barLabel.appendChild(labelEmptyRight);
                        }
                    }
                    catch (Error) { MyReference.Events.onError(Error); }
                };
                MyReference.GetBlockBackgroundColor = function(value) {
                    try
                    {
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
                    }
                    catch (Error) { MyReference.Events.onError(Error); }
                };
                MyReference.Public.GetMatrix = function () { 
                    return MyReference.MatrixJSON;
                };
                MyReference.onError = function(error) {
                    try
                    {
                        for (var eventIndex = 0; eventIndex < MyReference.Events.Error.length; eventIndex++)
                            MyReference.Events.Error[eventIndex](error);
                    }
                    catch (Error) { console.error(Error); }
                };
                MyReference.Public.Play =
                MyReference.Play = function() {
                    try
                    {
                        //if (MyReference.Algorithm.isNotComplete())
                        //    MyReference.Algorithm.Play();

                        for (var i = 0, len = MyReference.Algorithms.length; i < len; i++) {
                            MyReference.Algorithms[i].Play();
                        }
                    }
                    catch (Error) { MyReference.Events.onError(Error); }
                };
                MyReference.Public.Redraw =
                MyReference.Redraw = function(mapMatrixJSON) {
                    try {
                        Global.FreeRefManager.RemoveAllChildNodes(MyReference.Container);

                        MyReference.MatrixJSON = mapMatrixJSON;

                        //Map container
                        var mapContainer = document.createElement("div");
                        mapContainer.className = "MapContainer";

                        //Top bar labels
                        var topBarLabels = document.createElement("div");
                        topBarLabels.className = "BarLabels BarLabelsHorizontal";

                        MyReference.FillBarLabel(topBarLabels, MyReference.MatrixJSON.Size.Width, true);

                        mapContainer.appendChild(topBarLabels);

                        var mapSubContainer = document.createElement("div");
                        mapSubContainer.className = "MapSubContainer";

                        //Left bar labels
                        var leftBarLabels = document.createElement("div");
                        leftBarLabels.className = "BarLabels BarLabelsVertical";

                        MyReference.FillBarLabel(leftBarLabels, MyReference.MatrixJSON.Size.Height);

                        mapSubContainer.appendChild(leftBarLabels);

                        //#region Grid

                        //Grid container
                        var gridContainer = document.createElement("div");
                        gridContainer.className = "GridContainer";

                        for (var rowIndex = 0; rowIndex < MyReference.MatrixJSON.Size.Height; rowIndex++) {
                            var row = document.createElement("div");
                            row.className = "Row";
                            
                            var block;
                            
                            for (var colIndex = 0; colIndex < MyReference.MatrixJSON.Size.Width; colIndex++) {
                                block = document.createElement("div");

                                if (!MyReference.MatrixJSON.Matrix)
                                                MyReference.MatrixJSON.Matrix = [];
                                if (!MyReference.MatrixJSON.Matrix[rowIndex])
                                                MyReference.MatrixJSON.Matrix[rowIndex] = [];
                                if (!MyReference.MatrixJSON.Matrix[rowIndex][colIndex])
                                                MyReference.MatrixJSON.Matrix[rowIndex][colIndex] = {};
                                if (!MyReference.MatrixJSON.Matrix[rowIndex][colIndex].BlockType)
                                                MyReference.MatrixJSON.Matrix[rowIndex][colIndex].BlockType = BLOCK_TYPES.Names.Clear;


                                if ((MyReference.MatrixJSON.Matrix) 
                                    && (MyReference.MatrixJSON.Matrix[rowIndex])
                                    && (MyReference.MatrixJSON.Matrix[rowIndex][colIndex]))
                                {
                                    block.className = "Cell Block " + MyReference.MatrixJSON.Matrix[rowIndex][colIndex].BlockType.ClassName;
                                }
                                else {
                                    block.className = "Cell Block Clear"; 
                                }

//                                if((MyReference.EditionMode.Enabled == false)
//                                    &&((MyReference.MatrixJSON.Matrix[rowIndex][colIndex].BlockType.ID == BLOCK_TYPES.Names.Clear.ID)
//                                        || (MyReference.MatrixJSON.Matrix[rowIndex][colIndex].BlockType.ID == BLOCK_TYPES.Names.Start.ID)
//                                        || (MyReference.MatrixJSON.Matrix[rowIndex][colIndex].BlockType.ID == BLOCK_TYPES.Names.End.ID)))
//                                {
//                                    block.innerHTML = "0";
//                                }

                                if(MyReference.EditionMode.Enabled == true)
                                    block.className += " BlockEdition";

                                if(MyReference.FactorSize != null)
                                {
                                    block.style.height =
                                    block.style.width = MyReference.FactorSize.toString() + "px";
                                }

                                if ((MyReference.MatrixJSON.Matrix) 
                                    && (MyReference.MatrixJSON.Matrix[rowIndex])
                                    && (MyReference.MatrixJSON.Matrix[rowIndex][colIndex]))
                                {
                                    block.BlockType = MyReference.MatrixJSON.Matrix[rowIndex][colIndex].BlockType;
                                }
                                block.X = colIndex;
                                block.Y = rowIndex;

                                for (var eventIndex = 0; eventIndex < MyReference.Events.BlockClick.length; eventIndex++)
                                    window.Global.Events.AttachEventHandler(block, "onclick", MyReference.Events.BlockClick[eventIndex]);
                                for (eventIndex = 0; eventIndex < MyReference.Events.BlockMouseDown.length; eventIndex++)
                                    window.Global.Events.AttachEventHandler(block, "onmousedown", MyReference.Events.BlockMouseDown[eventIndex]);
                                for (eventIndex = 0; eventIndex < MyReference.Events.BlockMouseOver.length; eventIndex++)
                                    window.Global.Events.AttachEventHandler(block, "onmouseover", MyReference.Events.BlockMouseOver[eventIndex]);
                                for (eventIndex = 0; eventIndex < MyReference.Events.BlockMouseUp.length; eventIndex++)
                                    window.Global.Events.AttachEventHandler(block, "onmouseup", MyReference.Events.BlockMouseUp[eventIndex]);

                                row.appendChild(block);

                                if (!MyReference.MatrixJSON.Matrix) 
                                    MyReference.MatrixJSON.Matrix = [];
                                if (!MyReference.MatrixJSON.Matrix[rowIndex])
                                    MyReference.MatrixJSON.Matrix[rowIndex] = [];
                                if (!MyReference.MatrixJSON.Matrix[rowIndex][colIndex])
                                    MyReference.MatrixJSON.Matrix[rowIndex][colIndex] = {};

                                MyReference.MatrixJSON.Matrix[rowIndex][colIndex].Block = block;
                            }

                            //block.className += " CellLast";

                            //row.className = row.className.replace("Block", "Block BlockLast");

                            gridContainer.appendChild(row);
                        }

                        gridContainer.className = "GridContainer";

                        mapSubContainer.appendChild(gridContainer);

                        //Set Finder object coordinates.
                        if(MyReference.EditionMode.Enabled == false)
                        {
                            MyReference.Finder.X = MyReference.MatrixJSON.PointStart.X;
                            MyReference.Finder.Y = MyReference.MatrixJSON.PointStart.Y;

                            MyReference.MatrixJSON.Matrix[MyReference.Finder.Y][MyReference.Finder.X].Block.className += " " + BLOCK_TYPES.Names.Move.ClassName;
                        }

                        //#endregion

                        //Right bar labels
                        var rightBarLabels = document.createElement("div");
                        rightBarLabels.className = "BarLabels BarLabelsVertical";

                        MyReference.FillBarLabel(rightBarLabels, MyReference.MatrixJSON.Size.Height);

                        mapSubContainer.appendChild(rightBarLabels);

                        mapContainer.appendChild(mapSubContainer);

                        //Bottom bar labels
                        var bottomBarLabels = document.createElement("div");
                        bottomBarLabels.className = "BarLabels BarLabelsHorizontal";

                        MyReference.FillBarLabel(bottomBarLabels, MyReference.MatrixJSON.Size.Width, true);

                        mapContainer.appendChild(bottomBarLabels);

                        MyReference.Container.appendChild(mapContainer);
                    }
                    catch (Error) { MyReference.Events.onError(Error); }
                };
                MyReference.Public.SetBlockType =
                MyReference.SetBlockType = function(x, y, blockTypeToPaint) {
                    try {
                        if (!blockTypeToPaint)
                            blockTypeToPaint = MyReference.CurrentBlockTypeToPaint;

                        var oldBlockType = MyReference.MatrixJSON.Matrix[y][x].BlockType;

                        if (!oldBlockType)
                            oldBlockType = MyReference.CurrentBlockTypeToPaint;

                        MyReference.MatrixJSON.Matrix[y][x].BlockType = blockTypeToPaint;

                        switch (MyReference.MatrixJSON.Matrix[y][x].BlockType.ID) {
                            case BLOCK_TYPES.Names.Clear.ID:
                                //#region Clear

                                MyReference.MatrixJSON.Matrix[y][x].Block.className =
                                MyReference.MatrixJSON.Matrix[y][x].Block.className.replace(oldBlockType.ClassName, BLOCK_TYPES.Names.Clear.ClassName);

                                if ((MyReference.MatrixJSON.PointEnd) && (MyReference.MatrixJSON.PointEnd.X == x) && (MyReference.MatrixJSON.PointEnd.Y == y))
                                {
                                    MyReference.MatrixJSON.PointEnd.X =
                                    MyReference.MatrixJSON.PointEnd.Y = 1;

                                    return;
                                }

                                if ((MyReference.MatrixJSON.PointStart) && (MyReference.MatrixJSON.PointStart.X == x) && (MyReference.MatrixJSON.PointStart.Y == y))
                                {
                                    MyReference.MatrixJSON.PointStart.X =
                                    MyReference.MatrixJSON.PointStart.Y = 1;

                                    return;
                                }

                                //#endregion
                                break;
                            case BLOCK_TYPES.Names.End.ID:
                                //#region End

                                MyReference.MatrixJSON.Matrix[y][x].Block.className =
                                MyReference.MatrixJSON.Matrix[y][x].Block.className.replace(oldBlockType.ClassName, BLOCK_TYPES.Names.End.ClassName);

                                if ((MyReference.MatrixJSON.PointEnd) && (MyReference.MatrixJSON.PointEnd.X == x) && (MyReference.MatrixJSON.PointEnd.Y == y))
                                {
                                    return;
                                }
                                else
                                {
                                    if (MyReference.MatrixJSON.PointEnd) {
                                        MyReference.MatrixJSON.Matrix[MyReference.MatrixJSON.PointEnd.Y][MyReference.MatrixJSON.PointEnd.X].BlockType = BLOCK_TYPES.Names.Clear;
                                        MyReference.MatrixJSON.Matrix[MyReference.MatrixJSON.PointEnd.Y][MyReference.MatrixJSON.PointEnd.X].Block.className = 
                                            MyReference.MatrixJSON.Matrix[MyReference.MatrixJSON.PointEnd.Y][MyReference.MatrixJSON.PointEnd.X].Block.className.replace(
                                                BLOCK_TYPES.Names.End.ClassName
                                                , BLOCK_TYPES.Names.Clear.ClassName);
                                    }
                                    else {
                                        MyReference.MatrixJSON.PointEnd = {};
                                    }

                                    MyReference.MatrixJSON.PointEnd.X = x;
                                    MyReference.MatrixJSON.PointEnd.Y = y;
                                }

                                //#endregion
                                break;
                            case BLOCK_TYPES.Names.Start.ID:
                                //#region Start

                                MyReference.MatrixJSON.Matrix[y][x].Block.className = MyReference.MatrixJSON.Matrix[y][x].Block.className.replace(oldBlockType.ClassName, BLOCK_TYPES.Names.Start.ClassName);

                                if ((MyReference.MatrixJSON.PointStart) && (MyReference.MatrixJSON.PointStart.X == x) && (MyReference.MatrixJSON.PointStart.Y == y))
                                {
                                    return;
                                }
                                else
                                {
                                    if (MyReference.MatrixJSON.PointStart) {
                                        MyReference.MatrixJSON.Matrix[MyReference.MatrixJSON.PointStart.Y][MyReference.MatrixJSON.PointStart.X].BlockType = BLOCK_TYPES.Names.Clear;
                                        MyReference.MatrixJSON.Matrix[MyReference.MatrixJSON.PointStart.Y][MyReference.MatrixJSON.PointStart.X].Block.className = MyReference.MatrixJSON.Matrix[MyReference.MatrixJSON.PointStart.Y][MyReference.MatrixJSON.PointStart.X].Block.className.replace(
                                            BLOCK_TYPES.Names.Start.ClassName
                                            , BLOCK_TYPES.Names.Clear.ClassName);
                                    }
                                    else {
                                        MyReference.MatrixJSON.PointStart = {};
                                    }

                                    MyReference.MatrixJSON.PointStart.X = x;
                                    MyReference.MatrixJSON.PointStart.Y = y;
                                }

                                //#endregion
                                break;
                            case BLOCK_TYPES.Names.Wall.ID:
                                //#region Wall

                                MyReference.MatrixJSON.Matrix[y][x].Block.className = MyReference.MatrixJSON.Matrix[y][x].Block.className.replace(oldBlockType.ClassName, BLOCK_TYPES.Names.Wall.ClassName);

                                if ((MyReference.MatrixJSON.PointEnd) && (MyReference.MatrixJSON.PointEnd.X == x) && (MyReference.MatrixJSON.PointEnd.Y == y))
                                {
                                    MyReference.MatrixJSON.PointEnd.X =
                                    MyReference.MatrixJSON.PointEnd.Y = 1;

                                    return;
                                }

                                if ((MyReference.MatrixJSON.PointStart) && (MyReference.MatrixJSON.PointStart.X == x) && (MyReference.MatrixJSON.PointStart.Y == y))
                                {
                                    MyReference.MatrixJSON.PointStart.X =
                                    MyReference.MatrixJSON.PointStart.Y = 1;

                                    return;
                                }

                                //#endregion
                                break;
                            default:
                                return;
                        }
                    }
                    catch (Error) { MyReference.Events.onError(Error); }
                };
                MyReference.Public.SetCurrentBlockTypeToPaint =
                MyReference.SetCurrentBlockTypeToPaint = function(blockTypeToPaint) {
                    try
                    {
                        MyReference.CurrentBlockTypeToPaint = blockTypeToPaint;
                    }
                    catch (Error) { MyReference.Events.onError(Error); }
                };
                MyReference.Public.SetFactorSize = function (newFactorSize) { 
                    try
                    {
                        MyReference.FactorSize = newFactorSize;
                    }
                    catch (Error) { MyReference.Events.onError(Error); }
                };
//                MyReference.Public.UpdatePosition =
                MyReference.UpdatePosition = function(position) {
                    try
                    {
                        if (position) {
                            var x = position.x,
                                y = position.y;

                            MyReference.MatrixJSON.Matrix[MyReference.Finder.Y][MyReference.Finder.X].Block.className = 
                                MyReference.MatrixJSON.Matrix[MyReference.Finder.Y][MyReference.Finder.X].Block.className.replace(
                                    BLOCK_TYPES.Names.Move.ClassName
                                    , "");

                            MyReference.MatrixJSON.Matrix[MyReference.Finder.Y][MyReference.Finder.X].Block.style.backgroundColor = 
                                MyReference.GetBlockBackgroundColor(MyReference.MatrixJSON.Matrix[MyReference.Finder.Y][MyReference.Finder.X].Count);

                            MyReference.Finder.X = x;
                            MyReference.Finder.Y = y;

                            MyReference.MatrixJSON.Matrix[MyReference.Finder.Y][MyReference.Finder.X].Count++;

                            MyReference.MatrixJSON.Matrix[MyReference.Finder.Y][MyReference.Finder.X].Block.className += " " + BLOCK_TYPES.Names.Move.ClassName;

                            if ((MyReference.MatrixJSON.PointEnd.X == x) && (MyReference.MatrixJSON.PointEnd.Y == y))
                                return true;
                            else
                                return false;
                        }
                    }
                    catch (Error) { MyReference.Events.onError(Error); }
                    return false;
                };

                //#endregion

                //#region Events

                MyReference.Block_EditionMode_Click = function(e) {
                    try
                    {
                        var block = e.srcElement || e.target;

                        MyReference.SetBlockType(block.X, block.Y);
                    }
                    catch (Error) { MyReference.Events.onError(Error); }
                };
                MyReference.Block_EditionMode_MouseDown = function(e) {
                    try
                    {
                        MyReference.EditionMode.IsMouseDown = true;

                        var block = e.srcElement || e.target;

                        MyReference.SetBlockType(block.X, block.Y);
                    }
                    catch (Error) { MyReference.Events.onError(Error); }
                };
                MyReference.Block_EditionMode_MouseOver = function(e) {
                    try
                    {
                        if((MyReference.EditionMode.IsMouseDown == false) 
                            || ((MyReference.CurrentBlockTypeToPaint.ID == BLOCK_TYPES.Names.Start.ID) || (MyReference.CurrentBlockTypeToPaint.ID == BLOCK_TYPES.Names.End.ID)))
                        {
                            return;
                        }
                        else
                        {
                            var block = e.srcElement || e.target;

                            MyReference.SetBlockType(block.X, block.Y);
                        }
                    }
                    catch (Error) { MyReference.Events.onError(Error); }
                };
                MyReference.Block_EditionMode_MouseUp = function(e) {
                    try
                    {
                        MyReference.EditionMode.IsMouseDown = false;
                    }
                    catch (Error) { MyReference.Events.onError(Error); }
                };

                //#endregion

                //#endregion
            }
            catch (Error) { console.error(Error); }
        };
        PRIVATE_ATTRIBUTES_OBJECT.Constructor = function(container, options) {
            try
            {
                var PrivateParameters = new PRIVATE_ATTRIBUTES_OBJECT(options);

                PrivateParameters.Initialize(container);                

                //#region Public Attributes

                for(var publicAttrib in PrivateParameters.Public)
                    this[publicAttrib] = PrivateParameters.Public[publicAttrib];

                //#endregion
            }
            catch (Error) { console.error(Error); }
        }

        //#endregion

        window.PathFinderControler = PRIVATE_ATTRIBUTES_OBJECT.Constructor;
    }
    catch (Error) { console.error(Error); }
})();



//Que inicie dese una matrix ya hecha.
//eventos sobre los labels par asombreado de columna o fila
//cambiarle la forma que recibe las opcines por la forma que lo hacen los formwidgtes nuevos para evitar referencias en lso objetos de las opciones.