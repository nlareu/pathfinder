//#region BLOCK_TYPES

var btIndex = 0;
var blockPartialClassName = "Block";

window.BLOCK_TYPES = {
    Names:
    {
        Clear: { ID: ++btIndex, ClassName: blockPartialClassName + "Clear" }
        , End: { ID: ++btIndex, ClassName: blockPartialClassName + "End" }
        , Move: { ID: ++btIndex, ClassName: blockPartialClassName + "Move" }
        , Start: { ID: ++btIndex, ClassName: blockPartialClassName + "Start" }
        , Wall: { ID: ++btIndex, ClassName: blockPartialClassName + "Wall" }
    }
    , Indexes: {}
};

for(var blockTypeName in window.BLOCK_TYPES.Names)
    BLOCK_TYPES.Indexes[BLOCK_TYPES.Names[blockTypeName].ID] = BLOCK_TYPES.Names[blockTypeName];

delete blockTypeName;
delete blockPartialClassName;
delete btIndex;

//#endregion

(function()
{
    try
    {
        //#region _DIRECTIONS

        var iDirID = -1;
        //luego hacerlo un diccionario que tenga dos entradsa al mismo valor, numerico y "key" con el nombre de la direccion.
        //Par que asi su acceso sea dinamico y tambien facil.
        //The direction are relative to the screen.
        var _DIRECTIONS = [
            {ID: ++iDirID,      Name: "Left"        ,MX:-1  ,MY:0} //Left
            , {ID: ++iDirID,    Name: "Up"          ,MX:0   ,MY:-1} //Up
            , {ID: ++iDirID,    Name: "Right"       ,MX:1   ,MY:0} //Right
            , {ID: ++iDirID,    Name: "Down"        ,MX:0   ,MY:1} //Down
            , {ID: ++iDirID,    Name: "Up-Left"     ,MX:-1  ,MY:-1} //Up-Left
            , {ID: ++iDirID,    Name: "Up-Right"    ,MX:-1  ,MY:1} //Up-Right
            , {ID: ++iDirID,    Name: "Down-Right"  ,MX:1   ,MY:1} //Down-Right
            , {ID: ++iDirID,    Name: "Down-Left"   ,MX:1   ,MY:-1} //Down-Left
        ];
        delete iDirID;

        //#endregion

        //#region _POSITION_STATUS_TYPES

        var pstIndex = -1;
        var _POSITION_STATUS_TYPES =
        {
            Clear: ++pstIndex
            , End: ++pstIndex
            , Possible: ++pstIndex
            , Sealed: ++pstIndex
            , Start: ++pstIndex
            , Visited: ++pstIndex                    
        };
        delete pstIndex;
        //#endregion

        //#region PRIVATE_ATTRIBUTES_OBJECT

        var PRIVATE_ATTRIBUTES_OBJECT = function(options) {
            try
            {
                /* 
                    The variable "MyReference" is used inside the methods to keep the reference
                to "this" object.
                */
                var MyReference = this;

                for (var opt in options)
                    MyReference[opt] = options[opt];

                //#region Set optional options default values

                //if(!MyReference.Controler)
                    //throw new Error('Controler must be configured.');

                if(!MyReference.DirectionsCount)
                    MyReference.DirectionsCount = 4;
                if(!MyReference.Events)
                    MyReference.Events = {};
                //if(!MyReference.Events.onMoveComplete)
                  //MyReference.Events.onMoveComplete = function(x,y){ alert("x:'" + x + "',y:'" + y + "'") };
                if(!MyReference.Events.onError)
                    MyReference.Events.onError = function(error){ window.status = error.Message; }

                //#endregion

                //#region Attributes

                /* 
                    The property "MyReference.Public" will be used to set the public stuff 
                to the real instance.
                */
                MyReference.Public = {};

                //#region Properties

                MyReference.Controler = null;
                MyReference.CurrentStatus = null;
                MyReference.Directions = [];
                for(var iDir = 0; iDir < MyReference.DirectionsCount; iDir++)
                    MyReference.Directions.push(_DIRECTIONS[iDir]);
                MyReference.Id = PRIVATE_ATTRIBUTES_OBJECT.InstancesCount++;
                MyReference.IsRendered = false;
                //MyReference.isNotComplete = true;
                MyReference.Move = null;
//                MyReference.MoveInterval = 1;
                MyReference.PossibleWaysCollection = {};
                MyReference.PossibleWaysList = [];
                MyReference.Stage = null;

                //#endregion

                //#region Methods

                MyReference.Initialize = function(mapMatrixMM) {
                    try
                    {
                        var mapMatrixJSON = mapMatrixMM.GetMatrixJSON();

                        MyReference.Stage = MyReference.GetStage(mapMatrixJSON);

                        MyReference.CurrentStatus = {
                            //X:mapMatrixJSON.PointStart.X + 1
                            //,Y:mapMatrixJSON.PointStart.Y + 1
                            Dir:_DIRECTIONS[1] /* Usually start to the "Up" direcction. */
                        };

                        MyReference.Move = MyReference.DoFirstMove;
                    }
                    catch(Error){ MyReference.Events.onError(Error); }
                };
                MyReference.DoFirstMove = function() {
                    try
                    {
                        var nextDirection = null;
                        var oldPossiblePoint = { dir : null, data : null };
                
                        //Direccions
                        var ld = MyReference.Directions[(MyReference.CurrentStatus.Dir.ID + MyReference.Directions.length - 1) % MyReference.Directions.length];
                        var fd = MyReference.Directions[MyReference.CurrentStatus.Dir.ID];
                        var rd = MyReference.Directions[(MyReference.CurrentStatus.Dir.ID + 1) % MyReference.Directions.length];
                        var bd = MyReference.Directions[(MyReference.CurrentStatus.Dir.ID + (MyReference.Directions.length/2)) % MyReference.Directions.length];
                
                        //Coordinates
                        var lx = MyReference.CurrentStatus.X + ld.MX;
                        var ly = MyReference.CurrentStatus.Y + ld.MY;
                        var fx = MyReference.CurrentStatus.X + fd.MX;
                        var fy = MyReference.CurrentStatus.Y + fd.MY;
                        var rx = MyReference.CurrentStatus.X + rd.MX;
                        var ry = MyReference.CurrentStatus.Y + rd.MY;
                        var bx = MyReference.CurrentStatus.X + bd.MX;
                        var by = MyReference.CurrentStatus.Y + bd.MY;
                
                        //Points
                        var leftPoint = MyReference.Stage[lx][ly];
                        var forwardPoint = MyReference.Stage[fx][fy];
                        var rightPoint = MyReference.Stage[rx][ry];
                        var backwardPoint = MyReference.Stage[bx][by];
                           
                        //Set visited the last position 
                        MyReference.Stage[MyReference.CurrentStatus.X][MyReference.CurrentStatus.Y] = _POSITION_STATUS_TYPES.Visited;
                
                
                        //
                        // left point
                        //
                        if(leftPoint == _POSITION_STATUS_TYPES.Clear)
                        {
                            MyReference.Stage[lx][ly] = _POSITION_STATUS_TYPES.Possible;
                    
                            var foothCollection = {};
                            foothCollection[MyReference.CurrentStatus.X] = {};
                            foothCollection[MyReference.CurrentStatus.X][MyReference.CurrentStatus.Y] = {
                                ID:1
                                ,X:MyReference.CurrentStatus.X
                                ,Y:MyReference.CurrentStatus.Y
                            };
                    
                            MyReference.PossibleWaysList.push({
                                ID:MyReference.PossibleWaysList.length
                                ,X:lx
                                ,Y:ly
                                ,FoothList:[{
                                    X:MyReference.CurrentStatus.X
                                    ,Y:MyReference.CurrentStatus.Y
                                }]
                                ,FoothCollection:foothCollection
                            });
                    
                            if(MyReference.PossibleWaysCollection[lx] == null )
                                MyReference.PossibleWaysCollection[lx] = {};
                            MyReference.PossibleWaysCollection[lx][ly] = MyReference.PossibleWaysList[MyReference.PossibleWaysList.length-1]; //Keep reference
                    
                            oldPossiblePoint.data = MyReference.PossibleWaysList[MyReference.PossibleWaysList.length-1];
                            oldPossiblePoint.dir =
                            nextDirection = ld;
                        }
                        else if(leftPoint == _POSITION_STATUS_TYPES.End)
                        {
                            return MyReference.DoMove(MyReference.CurrentStatus.Y + ld.MY - 1, MyReference.CurrentStatus.X + ld.MX - 1, 0);
                            //MyReference.isNotComplete = false;
        //                    setTimeout(MyReference.Move, MyReference.MoveInterval);
                            //return;
                        }
                    
                    
                    
                        //
                        // forward point
                        //
                        if(forwardPoint == _POSITION_STATUS_TYPES.Clear)
                        {
                            MyReference.Stage[fx][fy] = _POSITION_STATUS_TYPES.Possible;
                    
                            var foothCollection = {};
                            foothCollection[MyReference.CurrentStatus.X] = {};
                            foothCollection[MyReference.CurrentStatus.X][MyReference.CurrentStatus.Y] = {
                                ID:1
                                ,X:MyReference.CurrentStatus.X
                                ,Y:MyReference.CurrentStatus.Y
                            };
                    
                            MyReference.PossibleWaysList.push({
                                ID:MyReference.PossibleWaysList.length
                                ,X:fx
                                ,Y:fy
                                ,FoothList:[{
                                    X:MyReference.CurrentStatus.X
                                    ,Y:MyReference.CurrentStatus.Y
                                }]
                                ,FoothCollection:foothCollection
                            });

                            if(MyReference.PossibleWaysCollection[fx] == null)
                                MyReference.PossibleWaysCollection[fx] = {};
                            MyReference.PossibleWaysCollection[fx][fy] = MyReference.PossibleWaysList[MyReference.PossibleWaysList.length-1]; //Keep reference
                    
    //                        if((oldPossiblePoint.data != null)&&(oldPossiblePoint.data.ID < MyReference.PossibleWaysList[MyReference.PossibleWaysList.length-1].ID))
                            if(oldPossiblePoint.data != null)
                            {
                                nextDirection = MyReference.Directions[oldPossiblePoint.dir.ID];
                            }
                            else
                            {
                                oldPossiblePoint.data = MyReference.PossibleWaysList[MyReference.PossibleWaysList.length-1];
                                oldPossiblePoint.dir = 
                                nextDirection = fd;                            
                            }
                        }
                        else if(forwardPoint == _POSITION_STATUS_TYPES.End)
                        {
                            return MyReference.DoMove(MyReference.CurrentStatus.Y + fd.MY - 1, MyReference.CurrentStatus.X + fd.MX - 1, 0);
                            //MyReference.isNotComplete = false;
        //                    setTimeout(MyReference.Move, MyReference.MoveInterval);
                            //return;
                        }
                                                                               

                        //
                        // right point
                        //
                        if(rightPoint == _POSITION_STATUS_TYPES.Clear)
                        {
                            MyReference.Stage[rx][ry] = _POSITION_STATUS_TYPES.Possible;
                    
                            var foothCollection = {};
                            foothCollection[MyReference.CurrentStatus.X] = {};
                            foothCollection[MyReference.CurrentStatus.X][MyReference.CurrentStatus.Y] = {
                                ID:1
                                ,X:MyReference.CurrentStatus.X
                                ,Y:MyReference.CurrentStatus.Y
                            };

                            MyReference.PossibleWaysList.push({
                                ID:MyReference.PossibleWaysList.length
                                ,X:rx
                                ,Y:ry
                                ,FoothList:[{
                                    X:MyReference.CurrentStatus.X
                                    ,Y:MyReference.CurrentStatus.Y
                                }]
                                ,FoothCollection:foothCollection
                            });

                            if(MyReference.PossibleWaysCollection[rx] == null)
                                MyReference.PossibleWaysCollection[rx] = {};
                            MyReference.PossibleWaysCollection[rx][ry] = MyReference.PossibleWaysList[MyReference.PossibleWaysList.length-1]; //Keep reference
                    
    //                        if((oldPossiblePoint.data != null)&&(oldPossiblePoint.data.ID < MyReference.PossibleWaysList[MyReference.PossibleWaysList.length-1].ID))
                            if(oldPossiblePoint.data != null)
                            {
                                nextDirection = MyReference.Directions[oldPossiblePoint.dir.ID];
                            }
                            else
                            {
                                oldPossiblePoint.data = MyReference.PossibleWaysList[MyReference.PossibleWaysList.length-1];
                                oldPossiblePoint.dir = 
                                nextDirection = rd;                             
                            }
                        }
                        else if(rightPoint == _POSITION_STATUS_TYPES.End)
                        {
                            return MyReference.DoMove(MyReference.CurrentStatus.Y + rd.MY - 1, MyReference.CurrentStatus.X + rd.MX - 1, 0);
                            //MyReference.isNotComplete = false;
        //                    setTimeout(MyReference.Move, MyReference.MoveInterval);
                            //return;
                        }



                        //
                        // backward point
                        //
                        if(backwardPoint == _POSITION_STATUS_TYPES.Clear)
                        {
                            MyReference.Stage[bx][by] = _POSITION_STATUS_TYPES.Possible;
                    
                            var foothCollection = {};
                            foothCollection[MyReference.CurrentStatus.X] = {};
                            foothCollection[MyReference.CurrentStatus.X][MyReference.CurrentStatus.Y] = {
                                ID:1
                                ,X:MyReference.CurrentStatus.X
                                ,Y:MyReference.CurrentStatus.Y
                            };

                            MyReference.PossibleWaysList.push({
                                ID:MyReference.PossibleWaysList.length
                                ,X:bx
                                ,Y:by
                                ,FoothList:[{
                                    X:MyReference.CurrentStatus.X
                                    ,Y:MyReference.CurrentStatus.Y
                                }]
                                ,FoothCollection:foothCollection
                            });

                            if(MyReference.PossibleWaysCollection[bx] == null)
                                MyReference.PossibleWaysCollection[bx] = {};
                            MyReference.PossibleWaysCollection[bx][by] = MyReference.PossibleWaysList[MyReference.PossibleWaysList.length-1]; //Keep reference
                    
    //                        if((oldPossiblePoint.data != null)&&(oldPossiblePoint.data.ID < MyReference.PossibleWaysList[MyReference.PossibleWaysList.length-1].ID))
                            if(oldPossiblePoint.data != null)
                            {
                                nextDirection = MyReference.Directions[oldPossiblePoint.dir.ID];
                            }
                            else
                            {
                                nextDirection = bd;
                            }
                        }
                        else if(backwardPoint == _POSITION_STATUS_TYPES.End)
                        {
                            return MyReference.DoMove(MyReference.CurrentStatus.Y + bd.MY - 1, MyReference.CurrentStatus.X + bd.MX - 1, 0);
                            //MyReference.isNotComplete = false;
        //                    setTimeout(MyReference.Move, MyReference.MoveInterval);
                            //return;
                        }


                        //Move conclusion.
                        if(!nextDirection)
                        {
                            //MyReference.isNotComplete = false;

                            //alert("No move is possible.");

                            return;
                        }
                        else
                        {
                            //Move 1 place depending the final direction.
                            MyReference.CurrentStatus.Dir = nextDirection;
                            //MyReference.CurrentStatus.X += nextDirection.MX;
                            //MyReference.CurrentStatus.Y += nextDirection.MY;
                    
                            MyReference.UpdatePosiblesWays();
                    
                            //Set MyReference.Move.
                            MyReference.Move = MyReference.GoToNextPoint;

                            return MyReference.DoMove(MyReference.CurrentStatus.Y += nextDirection.MY - 1, MyReference.CurrentStatus.X + nextDirection.MX - 1);
                        }
                    }
                    catch(Error){ MyReference.Events.onError(Error); }    
                };
                MyReference.DoMove = function (y, x) {
                    return {
                        position: {
                            y: y,
                            x: x,
                        },
                    };
                    /*
                    //Use a settmeout to fire the event after finish the current stack.
                    setTimeout(
                        function() {
                            MyReference.Events.onMoveComplete(y, x, 0);

                            MyReference.Play();
                        },
                        1
                    );*/
                };
                MyReference.GetId = function() {
                    return MyReference.Id;
                };
                MyReference.GetStage = function(matrixJSON) {
                    var stage = null;
                    try
                    {
                        if(!matrixJSON)
                        {
                            return stage;
                        }
                        else
                        {
                            var realWidth = matrixJSON.Size.Width + 2;
                            var realHeight = matrixJSON.Size.Height + 2;
        
                            stage = new Array(realWidth);

                            for(var iCol = 0; iCol < stage.length; iCol++)
                            {
                                stage[iCol] = new Array(realHeight);
                    
                                for(var iRow = 0; iRow < stage[iCol].length; iRow++)
                                    stage[iCol][iRow] = _POSITION_STATUS_TYPES.Clear;
                            }
                    
                            /* Set external walls. */
                            for(var iCol = 0; iCol < realWidth; iCol++)
                                stage[iCol][0] = _POSITION_STATUS_TYPES.Sealed;
                    
                            for(var iRow = 0; iRow < realHeight; iRow++)
                                stage[0][iRow] = _POSITION_STATUS_TYPES.Sealed;
                    
                            for(var iCol = 0; iCol < realWidth; iCol++)
                                stage[iCol][realHeight-1] = _POSITION_STATUS_TYPES.Sealed;
                    
                            for(var iRow = 0; iRow < realHeight; iRow++)
                                stage[realWidth-1][iRow] = _POSITION_STATUS_TYPES.Sealed;
                   
                            /* Map the rest of the map stage json. */
                            for(var y = 0; y < matrixJSON.Matrix.length; y++)
                            //for(var x in matrixJSON.Matrix)
                            {
                                var row = matrixJSON.Matrix[y];
                    
                                for(var x = 0; x < row.length; x++)
                                //for(var y in col)
                                {
                                    var cell = row[x];
                                    var posStatusType;

                                    if(cell.BlockType.ID == BLOCK_TYPES.Names.Clear.ID)
                                        posStatusType = _POSITION_STATUS_TYPES.Clear;
                                    else if(cell.BlockType.ID == BLOCK_TYPES.Names.Wall.ID)
                                        posStatusType = _POSITION_STATUS_TYPES.Sealed;

                                    stage[x + 1][y + 1] = posStatusType;
                                }
                            }               
                
                            stage[matrixJSON.PointStart.X + 1][matrixJSON.PointStart.Y + 1] = _POSITION_STATUS_TYPES.Start;
                            stage[matrixJSON.PointEnd.X + 1][matrixJSON.PointEnd.Y + 1] = _POSITION_STATUS_TYPES.End;
                        }
                    }
                    catch(Error){ MyReference.Events.onError(Error); }
                    return stage;
                };
                MyReference.GoToLastPossible = function() {
                    try
                    {
                        var lastPossiblePoint = MyReference.PossibleWaysList[MyReference.PossibleWaysList.length-1];
                        var nextDirection = null;
                        var nextPosible = null;              
                
                        //Direccions
                        var ld = MyReference.Directions[(MyReference.CurrentStatus.Dir.ID + MyReference.Directions.length - 1) % MyReference.Directions.length];
                        var fd = MyReference.Directions[MyReference.CurrentStatus.Dir.ID];
                        var rd = MyReference.Directions[(MyReference.CurrentStatus.Dir.ID + 1) % MyReference.Directions.length];
                
                        //Coordinates
                        var lx = MyReference.CurrentStatus.X + ld.MX;
                        var ly = MyReference.CurrentStatus.Y + ld.MY;
                        var fx = MyReference.CurrentStatus.X + fd.MX;
                        var fy = MyReference.CurrentStatus.Y + fd.MY;
                        var rx = MyReference.CurrentStatus.X + rd.MX;
                        var ry = MyReference.CurrentStatus.Y + rd.MY;
                
                
                        //
                        // left point
                        //
                        if((lastPossiblePoint.X == lx)&&(lastPossiblePoint.Y == ly))
                        {
                            //Set current status
                            MyReference.CurrentStatus.Dir = ld;
                            //MyReference.CurrentStatus.X = lx;
                            //MyReference.CurrentStatus.Y = ly;
                    
                            MyReference.UpdatePosiblesWays();
                    
                            //Set MyReference.Move
                            MyReference.Move = MyReference.GoToNextPoint;
                        
                            return MyReference.DoMove(ly - 1, lx - 1, 0);

        //                        //Call itself again
        //                        setTimeout(MyReference.Move, MyReference.MoveInterval);
                    
                            //Continue regular moving 
                            //return;
                        }
                        else if((lastPossiblePoint.FoothCollection[lx]) && (lastPossiblePoint.FoothCollection[lx][ly]))
                        {
                            nextDirection = ld;
                            nextPosible = lastPossiblePoint.FoothCollection[lx][ly];                        
                        }
                        
                        
                        //
                        // forward point
                        //
                        //Only search in MyReference.PossibleWaysCollection points.
                        if((lastPossiblePoint.X == fx)&&(lastPossiblePoint.Y == fy))
                        {
                             //Set current status
                            MyReference.CurrentStatus.Dir = fd;
                            //MyReference.CurrentStatus.X = fx;
                            //MyReference.CurrentStatus.Y = fy;
                    
                            MyReference.UpdatePosiblesWays();

                            //Set MyReference.Move
                            MyReference.Move = MyReference.GoToNextPoint;
                    
                            return MyReference.DoMove(fy - 1, fx - 1, 0);

        //                        //Call itself again
        //                        setTimeout(MyReference.Move, MyReference.MoveInterval);
                    
                            //Continue regular moving 
                            //return;
                        }
                        else if(((lastPossiblePoint.FoothCollection[fx]) && (lastPossiblePoint.FoothCollection[fx][fy]))
                                && ((!nextPosible) || (lastPossiblePoint.FoothCollection[fx][fy].ID < nextPosible.ID)))
                        {
                            nextDirection = fd;
                            nextPosible = lastPossiblePoint.FoothCollection[fx][fy];
                        }
                        
                        
                        //
                        // right point
                        //
                        //Only search in MyReference.PossibleWaysCollection points.
                        if((lastPossiblePoint.X == rx)&&(lastPossiblePoint.Y == ry))
                        {
                             //Set current status
                            MyReference.CurrentStatus.Dir = rd;
                            //MyReference.CurrentStatus.X = rx;
                            //MyReference.CurrentStatus.Y = ry;
                    
                            MyReference.UpdatePosiblesWays();
                    
                            //Set MyReference.Move
                            MyReference.Move = MyReference.GoToNextPoint;
                    
                            return MyReference.DoMove(ry - 1, rx - 1, 0);

        //                        //Call itself again
        //                        setTimeout(MyReference.Move, MyReference.MoveInterval);

                            //Continue regular moving 
                            //return;
                        }
                        else if(((lastPossiblePoint.FoothCollection[rx]) && (lastPossiblePoint.FoothCollection[rx][ry]))
                                && ((!nextPosible) || (lastPossiblePoint.FoothCollection[rx][ry].ID < nextPosible.ID)))
                        {
                            nextDirection = rd;
                            nextPosible = lastPossiblePoint.FoothCollection[rx][ry];
                        }
                
                        //Continue go to the last posible
                        //Set current status
                        MyReference.CurrentStatus.Dir = nextDirection;
                        //MyReference.CurrentStatus.X = nextPosible.X;
                        //MyReference.CurrentStatus.Y = nextPosible.Y;
                
                        MyReference.UpdatePosiblesWays();
                
                        return MyReference.DoMove(nextPosible.Y - 1, nextPosible.X - 1, 0);

        //                        //Call itself again
        //                        setTimeout(MyReference.GoToLastPossible, MyReference.MoveInterval);
                    }
                    catch(Error){ MyReference.Events.onError(Error); }
                };
                MyReference.GoToNextPoint = function() {
                    try
                    {
                        var nextDirection = null;
                        var oldPossiblePoint = { dir : null, data : null };
                
                        //Direccions
                        var ld = MyReference.Directions[(MyReference.CurrentStatus.Dir.ID + MyReference.Directions.length - 1) % MyReference.Directions.length];
                        var fd = MyReference.Directions[MyReference.CurrentStatus.Dir.ID];
                        var rd = MyReference.Directions[(MyReference.CurrentStatus.Dir.ID + 1) % MyReference.Directions.length];
                
                        //Coordinates
                        var lx = MyReference.CurrentStatus.X + ld.MX;
                        var ly = MyReference.CurrentStatus.Y + ld.MY;
                        var fx = MyReference.CurrentStatus.X + fd.MX;
                        var fy = MyReference.CurrentStatus.Y + fd.MY;
                        var rx = MyReference.CurrentStatus.X + rd.MX;
                        var ry = MyReference.CurrentStatus.Y + rd.MY;
                
                        //Points
                        var leftPoint = MyReference.Stage[lx][ly];
                        var forwardPoint = MyReference.Stage[fx][fy];
                        var rightPoint = MyReference.Stage[rx][ry];
                           
                        //Set visited the last position 
                        MyReference.Stage[MyReference.CurrentStatus.X][MyReference.CurrentStatus.Y] = _POSITION_STATUS_TYPES.Visited;
                
                
                        //
                        // left point
                        //
                        if(leftPoint == _POSITION_STATUS_TYPES.Clear)
                        {
                            MyReference.Stage[lx][ly] = _POSITION_STATUS_TYPES.Possible;
                    
                            var foothCollection = {};
                            foothCollection[MyReference.CurrentStatus.X] = {};
                            foothCollection[MyReference.CurrentStatus.X][MyReference.CurrentStatus.Y] = {
                                ID:1
                                ,X:MyReference.CurrentStatus.X
                                ,Y:MyReference.CurrentStatus.Y
                            };
                    
                            MyReference.PossibleWaysList.push({
                                ID:MyReference.PossibleWaysList.length
                                ,X:lx
                                ,Y:ly
                                ,FoothList:[{
                                    X:MyReference.CurrentStatus.X
                                    ,Y:MyReference.CurrentStatus.Y
                                }]
                                ,FoothCollection:foothCollection
                            });
                    
                            if(MyReference.PossibleWaysCollection[lx] == null )
                                MyReference.PossibleWaysCollection[lx] = {};
                            MyReference.PossibleWaysCollection[lx][ly] = MyReference.PossibleWaysList[MyReference.PossibleWaysList.length-1]; //Keep reference
                    
                            oldPossiblePoint.data = MyReference.PossibleWaysList[MyReference.PossibleWaysList.length-1];
                            oldPossiblePoint.dir =
                            nextDirection = ld;
                        }
                        else if(leftPoint == _POSITION_STATUS_TYPES.Possible)
                        {
                            oldPossiblePoint.data = MyReference.PossibleWaysCollection[lx][ly];
                            oldPossiblePoint.dir =
                            nextDirection = ld;
                        }
                        else if(leftPoint == _POSITION_STATUS_TYPES.End)
                        {
                            return MyReference.DoMove(MyReference.CurrentStatus.Y + ld.MY - 1, MyReference.CurrentStatus.X + ld.MX - 1, 0);
                            //MyReference.isNotComplete = false;
        //                    setTimeout(MyReference.Move, MyReference.MoveInterval);
                            //return;
                        }
                    
                    
                    
                        //
                        // forward point
                        //
                        if(forwardPoint == _POSITION_STATUS_TYPES.Clear)
                        {
                            MyReference.Stage[fx][fy] = _POSITION_STATUS_TYPES.Possible;
                    
                            var foothCollection = {};
                            foothCollection[MyReference.CurrentStatus.X] = {};
                            foothCollection[MyReference.CurrentStatus.X][MyReference.CurrentStatus.Y] = {
                                ID:1
                                ,X:MyReference.CurrentStatus.X
                                ,Y:MyReference.CurrentStatus.Y
                            };
                    
                            MyReference.PossibleWaysList.push({
                                ID:MyReference.PossibleWaysList.length
                                ,X:fx
                                ,Y:fy
                                ,FoothList:[{
                                    X:MyReference.CurrentStatus.X
                                    ,Y:MyReference.CurrentStatus.Y
                                }]
                                ,FoothCollection:foothCollection
                            });

                            if(MyReference.PossibleWaysCollection[fx] == null)
                                MyReference.PossibleWaysCollection[fx] = {};
                            MyReference.PossibleWaysCollection[fx][fy] = MyReference.PossibleWaysList[MyReference.PossibleWaysList.length-1]; //Keep reference
                    
    //                        if((oldPossiblePoint.data != null)&&(oldPossiblePoint.data.ID < MyReference.PossibleWaysList[MyReference.PossibleWaysList.length-1].ID))
                            if(oldPossiblePoint.data != null)
                            {
                                nextDirection = MyReference.Directions[oldPossiblePoint.dir.ID];
                            }
                            else
                            {
                                oldPossiblePoint.data = MyReference.PossibleWaysList[MyReference.PossibleWaysList.length-1];
                                oldPossiblePoint.dir = 
                                nextDirection = fd;                            
                            }
                        }
                        else if(forwardPoint == _POSITION_STATUS_TYPES.Possible)
                        {
                            if((oldPossiblePoint.data != null)&&((MyReference.PossibleWaysCollection[fx])&&(MyReference.PossibleWaysCollection[fx][fy])&&(oldPossiblePoint.data.ID < MyReference.PossibleWaysCollection[fx][fy].ID)))
                            {
                                nextDirection = MyReference.Directions[oldPossiblePoint.dir.ID];
                            }
                            else
                            {
                                oldPossiblePoint.data = MyReference.PossibleWaysCollection[fx][fy];
                                oldPossiblePoint.dir = 
                                nextDirection = fd;                            
                            }
                        }
                        else if(forwardPoint == _POSITION_STATUS_TYPES.End)
                        {
                            return MyReference.DoMove(MyReference.CurrentStatus.Y + fd.MY - 1, MyReference.CurrentStatus.X + fd.MX - 1, 0);
                            //MyReference.isNotComplete = false;
        //                    setTimeout(MyReference.Move, MyReference.MoveInterval);
                            //return;
                        }
                    
                    
                    
                        //
                        // right point
                        //
                        if(rightPoint == _POSITION_STATUS_TYPES.Clear)
                        {
                            MyReference.Stage[rx][ry] = _POSITION_STATUS_TYPES.Possible;
                    
                            var foothCollection = {};
                            foothCollection[MyReference.CurrentStatus.X] = {};
                            foothCollection[MyReference.CurrentStatus.X][MyReference.CurrentStatus.Y] = {
                                ID:1
                                ,X:MyReference.CurrentStatus.X
                                ,Y:MyReference.CurrentStatus.Y
                            };

                            MyReference.PossibleWaysList.push({
                                ID:MyReference.PossibleWaysList.length
                                ,X:rx
                                ,Y:ry
                                ,FoothList:[{
                                    X:MyReference.CurrentStatus.X
                                    ,Y:MyReference.CurrentStatus.Y
                                }]
                                ,FoothCollection:foothCollection
                            });

                            if(MyReference.PossibleWaysCollection[rx] == null)
                                MyReference.PossibleWaysCollection[rx] = {};
                            MyReference.PossibleWaysCollection[rx][ry] = MyReference.PossibleWaysList[MyReference.PossibleWaysList.length-1]; //Keep reference
                    
    //                        if((oldPossiblePoint.data != null)&&(oldPossiblePoint.data.ID < MyReference.PossibleWaysList[MyReference.PossibleWaysList.length-1].ID))
                            if(oldPossiblePoint.data != null)
                            {
                                nextDirection = MyReference.Directions[oldPossiblePoint.dir.ID];
                            }
                            else
                            {
                                nextDirection = rd;                            
                            }
                        }
                        else if(rightPoint == _POSITION_STATUS_TYPES.Possible)
                        {
                            if((oldPossiblePoint.data != null)&&((MyReference.PossibleWaysCollection[rx])&&(MyReference.PossibleWaysCollection[rx][ry])&&(oldPossiblePoint.data.ID < MyReference.PossibleWaysCollection[rx][ry].ID)))
                            {
                                nextDirection = MyReference.Directions[oldPossiblePoint.dir.ID];
                            }
                            else
                            {
                                nextDirection = rd;
                            }
                        }
                        else if(rightPoint == _POSITION_STATUS_TYPES.End)
                        {
                            return MyReference.DoMove(MyReference.CurrentStatus.Y + rd.MY - 1, MyReference.CurrentStatus.X + rd.MX - 1, 0);
                            //MyReference.isNotComplete = false;
        //                    setTimeout(MyReference.Move, MyReference.MoveInterval);
                            //return;
                        }
                
                
                        if(!nextDirection)
                        {
                            //Turn back the direcction
                            MyReference.CurrentStatus.Dir = MyReference.Directions[(MyReference.CurrentStatus.Dir.ID + (MyReference.Directions.length/2)) % MyReference.Directions.length];
                
                            //Set MyReference.Move
                            MyReference.Move = MyReference.GoToLastPossible;
                
                            //Go to the last Possible Point
                            MyReference.GoToLastPossible();
                        }
                        else
                        {
                            //Move 1 place depending the final direction.
                            MyReference.CurrentStatus.Dir = nextDirection;
                            //MyReference.CurrentStatus.X += nextDirection.MX;
                            //MyReference.CurrentStatus.Y += nextDirection.MY;
                    
                            MyReference.UpdatePosiblesWays();
                    
                            return MyReference.DoMove(MyReference.CurrentStatus.Y + nextDirection.MY - 1, MyReference.CurrentStatus.X + nextDirection.MX - 1, 0);

                            //Call itself again
        //                    setTimeout(MyReference.Move, MyReference.MoveInterval);
                        }
                    }
                    catch(Error){ MyReference.Events.onError(Error); }
                };
                //MyReference.Public.isNotComplete = function() { 
                //    return MyReference.isNotComplete;
                //};
                MyReference.Public.Play =
                MyReference.Play = function() { 
                    try
                    {
                        MyReference.Start();
                        //MyReference.Move();
                    }
                    catch(Error){ MyReference.Events.onError(Error); }
                };
                MyReference.Render = function() { 
                    try
                    {
                        MyReference.MapDom = MyReference.Controler.GetMapDom();
                        MyReference.FactorSize = MyReference.Controler.GetFactorSize();

                        MyReference.AvatarDom = document.createElement('div');
                        MyReference.AvatarDom.style['position'] = 'absolute';
                        MyReference.AvatarDom.style['width'] = MyReference.FactorSize + 'px';
                        MyReference.AvatarDom.style['height'] = MyReference.FactorSize + 'px';

                        MyReference.Render_DirDownStatic();

                        MyReference.MapDom.appendChild(MyReference.AvatarDom);

                        MyReference.IsRendered = true;
                    }
                    catch(Error){ MyReference.Events.onError(Error); }
                };
                MyReference.Render_DirDownStatic = function() { 
                    try
                    {
                        MyReference.AvatarDom.style['background-image'] = 'url("styles/img/avatar-static.png")';
                        MyReference.AvatarDom.style['background-size'] = '290px 110px';
                        MyReference.AvatarDom.style['background-position'] = '-5px -138px';
                    }
                    catch(Error){ MyReference.Events.onError(Error); }
                };
                MyReference.Render_DirDownWalking = function() { 
                    try
                    {
                        MyReference.AvatarDom.style['background-image'] = 'url("styles/img/avatar-walking.gif")';
                        MyReference.AvatarDom.style['background-size'] = '290px 110px';
                        MyReference.AvatarDom.style['background-position'] = '-60px -110px';
                    }
                    catch(Error){ MyReference.Events.onError(Error); }
                };
                MyReference.Render_DirLeftWalking = function() { 
                    try
                    {
                        MyReference.AvatarDom.style['background-image'] = 'url("styles/img/avatar-walking.gif")';
                        MyReference.AvatarDom.style['background-size'] = '290px 110px';
                        MyReference.AvatarDom.style['background-position'] = '-175px -110px';
                    }
                    catch(Error){ MyReference.Events.onError(Error); }
                };
                MyReference.Render_DirRightWalking = function() { 
                    try
                    {
                        MyReference.AvatarDom.style['background-image'] = 'url("styles/img/avatar-walking.gif")';
                        MyReference.AvatarDom.style['background-size'] = '290px 110px';
                        MyReference.AvatarDom.style['background-position'] = '-175px -60px';
                    }
                    catch(Error){ MyReference.Events.onError(Error); }
                };
                MyReference.Render_DirUpWalking = function() { 
                    try
                    {
                        MyReference.AvatarDom.style['background-image'] = 'url("styles/img/avatar-walking.gif")';
                        MyReference.AvatarDom.style['background-size'] = '290px 110px';
                        MyReference.AvatarDom.style['background-position'] = '-60px -60px';

                    }
                    catch(Error){ MyReference.Events.onError(Error); }
                };
                MyReference.Public.Render_Finish =
                MyReference.Render_Finish = function() { 
                    try
                    {
                        MyReference.Render_DirDownStatic();
                    }
                    catch(Error){ MyReference.Events.onError(Error); }
                };
                MyReference.Public.Start =
                MyReference.Start = function() { 
                    try
                    {
                        //Ask controler for permission to move.
                        MyReference.Controler.AskForPermissionToMove(MyReference);
                    }
                    catch(Error){ MyReference.Events.onError(Error); }
                };
                MyReference.Public.SetControler =
                MyReference.SetControler = function(controler) { 
                    try
                    {
                        MyReference.Controler = controler;
                    }
                    catch(Error){ MyReference.Events.onError(Error); }
                };
                MyReference.Public.SetCurrentPosition =
                MyReference.SetCurrentPosition = function(position, callback) { 
                    try
                    {
                        var wasRendered = MyReference.IsRendered;

                        if (MyReference.IsRendered == false)
                            MyReference.Render();

                        var x = position.x + 1,
                            y = position.y + 1,
                            prevX = MyReference.CurrentStatus.X,
                            prevY = MyReference.CurrentStatus.Y;

                        MyReference.CurrentStatus.Y = position.y + 1;
                        MyReference.CurrentStatus.X = position.x + 1;


                        //Render direction
                        if (prevX - x < 0)
                            MyReference.Render_DirRightWalking();
                        else if (prevX - x > 0)
                            MyReference.Render_DirLeftWalking();
                        else if (prevY - y < 0)
                            MyReference.Render_DirDownWalking();
                        else if (prevY - y > 0)
                            MyReference.Render_DirUpWalking();


                        //Update position in the dom. If it is not hgte initial position, use an animation.
                        if (wasRendered == true) {
                            $(MyReference.AvatarDom).animate(
                                { 
                                    top: (position.y * MyReference.FactorSize) + 'px',
                                    left: (position.x * MyReference.FactorSize) + 'px',
                                }, 
                                {
                                    complete: callback,
                                    duration: 500,
                                    easing: 'linear',
                                }
                            );
                        }
                        else {
                            MyReference.AvatarDom.style['top'] = (position.y * MyReference.FactorSize) + 'px';
                            MyReference.AvatarDom.style['left'] = (position.x * MyReference.FactorSize) + 'px';

                            if (callback)
                                callback();
                        }
                    }
                    catch(Error){ MyReference.Events.onError(Error); }
                };
                MyReference.UpdatePosiblesWays = function() {
                    try
                    {
                        //Remove from MyReference.PossibleWaysList & MyReference.PossibleWaysCollection.
                        if((MyReference.PossibleWaysCollection[MyReference.CurrentStatus.X] != null) && (MyReference.PossibleWaysCollection[MyReference.CurrentStatus.X][MyReference.CurrentStatus.Y] != null))
                        {
                            MyReference.PossibleWaysList.splice(MyReference.PossibleWaysCollection[MyReference.CurrentStatus.X][MyReference.CurrentStatus.Y].ID, 1);
                    
                            delete MyReference.PossibleWaysCollection[MyReference.CurrentStatus.X][MyReference.CurrentStatus.Y];
                        }
                
                        //Update MyReference.PossibleWaysList. For reference update MyReference.PossibleWaysCollection.
                        for(var ipp = 0; ipp < MyReference.PossibleWaysList.length; ipp++)
                        {
                            MyReference.PossibleWaysList[ipp].ID = ipp;
                
                            MyReference.PossibleWaysList[ipp].FoothList.push({
                                X:MyReference.CurrentStatus.X
                                ,Y:MyReference.CurrentStatus.Y
                            });
                    
                            if(!MyReference.PossibleWaysList[ipp].FoothCollection[MyReference.CurrentStatus.X])
                                MyReference.PossibleWaysList[ipp].FoothCollection[MyReference.CurrentStatus.X] = {}
                        
                            MyReference.PossibleWaysList[ipp].FoothCollection[MyReference.CurrentStatus.X][MyReference.CurrentStatus.Y] = {
                                ID:MyReference.PossibleWaysList[ipp].FoothList.length
                                ,X:MyReference.CurrentStatus.X
                                ,Y:MyReference.CurrentStatus.Y
                            }
                        }
                    }
                    catch(Error){ MyReference.Events.onError(Error); }
                };

                //#endregion

                //#endregion
            }
            catch(Error) { Global.ShowError(Error); }
        };
        PRIVATE_ATTRIBUTES_OBJECT.Constructor =  function (map, options) {
            try
            {
                var MyReference = new PRIVATE_ATTRIBUTES_OBJECT(options);
        
                MyReference.Initialize(map);
        
                //#region Public Attributes

                for(var publicAttrib in MyReference.Public)
                    this[publicAttrib] = MyReference.Public[publicAttrib];

                //#endregion
            }
            catch(Error) { Global.ShowError(Error); }
        }
        PRIVATE_ATTRIBUTES_OBJECT.InstancesCount = 0;
    
        //#endregion

        window.PathFinderCaracol = PRIVATE_ATTRIBUTES_OBJECT.Constructor;
    }
    catch(Error) { Global.ShowError(Error); }
})();

//Para ahorrar memoria y trabajo definir las coordenadas de cada lugar qeu l orodea en el momento adecuado.