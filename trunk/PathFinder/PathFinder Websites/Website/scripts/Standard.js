//#region Global object.

window.Global = {};
Global.IsTesting = true;

//#region Events

Global.Events = 
{

    //#region AttachDomReadyEventHandler
    
    AttachDomReadyEventHandler: function(fn) {
        try
        {
            if (document.addEventListener)
                document.addEventListener("DOMContentLoaded", fn, false);
            else if (document.all && !window.opera)
            {
                document.write('<script type="text/javascript" id="contentLoadTag" defer="defer" src="javascript:void(0)"><\/script>');

                var contentLoadTag = document.getElementById("contentLoadTag");

                contentLoadTag.onreadystatechange = function ()
                {
                    if (this.readyState == "complete")
                        fn();
                };
            }
        }
        catch (Error) { console.error(Error); }
    }

    //#endregion

    //#region AttachEventHandler

    , AttachEventHandler: function(obj, event, delegHandler)
    {
        try {
            if (navigator.appName == 'Microsoft Internet Explorer') obj.attachEvent(event, delegHandler, false);
            else if ((navigator.appName == 'Netscape') || (navigator.appName == 'Opera')) {
                event = event.substring(2, event.length);
                obj.addEventListener(event, delegHandler, false);
            }
        }
        catch (Error) { console.error(Error); }
    }

    //#endregion

    //#region RemoveEventHandler

    , RemoveEventHandler: function(obj, event, delegHandler)
    {
        try
        {
            if (navigator.appName == 'Microsoft Internet Explorer') obj.detachEvent(event, delegHandler, false);
            else if ((navigator.appName == 'Netscape') || (navigator.appName == 'Opera')) {
                event = event.substring(2, event.length);
                obj.removeEventListener(event, delegHandler, false);
            }
        }
        catch (Error) { console.error(Error); }
    }

    //#endregion

}

//#endregion

//#region FreeRefManager

Global.FreeRefManager =  {
    RemoveAllChildNodes: function (parent) {
        try
        {
            if ((parent) && (parent.childNodes.length > 0)) {
                for (var i = parent.childNodes.length - 1; i > -1; i--) {
                    var c = parent.childNodes[i];
                    if ((c.childNodes) && (c.childNodes.length > 0)) this.RemoveAllChildNodes(c);
                    parent.removeChild(c);
                    this.ReleaseAllReference(c);
                    if (c.innerHTML)
                        c.innerHTML = '';
                    delete c;
                    c = null;
                }
            }
        }
        catch (Error) { console.error(Error); }
    },
    ReleaseAllReference: function (obj) {
        try
        {
            var c, t, l, n;
            c = obj.childNodes;
            if (c) {
                l = c.length;
                for (t = 0; t < l; t++) {
                    this.ReleaseAllReference(obj.childNodes[t]);
                }
            }
            c = obj.attributes;
            if (c) {
                l = c.length;
                for (t = 0; t < l; t++) {
                    n = c[t].name;
                    if (typeof (obj[n]) == 'function') {
                        obj[n] = null;
                    }
                }
            }
        }
        catch (Error) { console.error(Error); }
    }
};

//#endregion

//#region Dom objecy properties.

Global.GetRealHeigth = function(elem) {
    try
    {
        return Global.GetRealObjectDimension(elem, "heigth");
    }
    catch(Error) { console.error(Error); }
}
Global.GetRealWidth = function(elem) {
    try
    {
        return Global.GetRealObjectDimension(elem, "width");
    }
    catch(Error) { console.error(Error); }
}
Global.GetRealObjectDimension = function(elem, propertyName) {
    try
    {
        return (("scrollTo" in window) && (elem.document))
                    // does it walk and quack like a window?
                    // Everyone else use document.documentElement or document.body depending on Quirks vs Standards mode
                    ? elem.document.compatMode === "CSS1Compat" && elem.document.documentElement[ "client" + propertyName ] || elem.document.body[ "client" + propertyName ] 
        			// Get document width or height
                    : (elem.nodeType === 9) 
                            // is it a document
				            // Either scroll[Width/Height] or offset[Width/Height], whichever is greater
                            ? Math.max(
					            elem.documentElement["client" + propertyName]
                                , elem.body["scroll" + propertyName], elem.documentElement["scroll" + propertyName]
                                , elem.body["offset" + propertyName], elem.documentElement["offset" + propertyName]) 
				            // Get width or height on the element
                            : elem.style.width;
    }
    catch(Error) { console.error(Error); }
    return -1;
};

//#endregion

//#region JSON

(function() {
    var specialChars = { '\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"': '\\"', '\\': '\\\\' }

    function _replaceChars(chr) {
        return specialChars[chr] || '\\u00' + Math.floor(chr.charCodeAt() / 16).toString(16) + (chr.charCodeAt() % 16).toString(16);
    }

    function _getType(obj) {
        try {
            if (obj == undefined) return false;
            if (obj.nodeName) {
                switch (obj.nodeType) {
                    case 1: return 'element';
                    case 3: return (/\S/).test(obj.nodeValue) ? 'textnode' : 'whitespace';
                }
            } else if (typeof obj.length == 'number') {
                if (obj.callee) return 'arguments';
                else if (obj.item) return 'collection';
                else if (typeof (obj) != 'string') return 'array';
            }
            if (typeof (obj)) return (typeof (obj) == 'number' && !isFinite(obj)) ? false : typeof (obj);
            return typeof obj;
        }
        catch (Error) { }
    }

    function _JSONEncode(obj) {
        try {
            switch (_getType(obj)) {
                case 'string':
                    return '"' + obj.replace(/[\x00-\x1f\\"]/g, _replaceChars) + '"';
                case 'array':
                    var parse = '[';
                    for (var i = 0; i < obj.length; i++) parse += String(_JSONEncode(obj[i])) + ',';
                    parse = (parse.length > 1) ? parse.substring(0, parse.length - 1) : parse;
                    return (parse + ']');
                case 'object':
                    var string = [];
                    for (var key in obj) {
                        var json = _JSONEncode(obj[key]);
                        if (json) string.push(_JSONEncode(key) + ':' + json);
                    }
                    return '{' + string + '}';
                case 'number':
                case 'boolean':
                    return String(obj);
                case false:
                    return 'null';
            }
            return null;
        }
        catch (Error) { return Error; }
    }

    Global.JSONEncode = function (obj) { return _JSONEncode(obj); }

    function _JSONDecode(string, secure) {
        try {
            if (_getType(string) != 'string' || !string.length) return null;
            if (secure && !(/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(string.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, ''))) return null;
            return eval('(' + string + ')');
        }
        catch (Error) { return Error; }
    }

    Global.JSONDecode = function (string, secure) { return _JSONDecode(string, secure); }
})();

//#endregion

//#region ShowError

Global.ShowError = function(error)
{
    try
    {
        if(Global.IsTesting == true)
            alert(error.Message)
        else
            window.status = error.Message;
    }
    catch (Error) { window.status = Error.Message; }
}

//#endregion

//#endregion

//#region PathFinder Stuff

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

//#region MAP_MATRIX_TYPES

var mmtIndex = 0;

window.MAP_MATRIX_TYPES = {
    Names:
    {
//        Empty:      { ID:++mmtIndex, Name:null }
        JSON:     { ID:++mmtIndex, Name:null }
        , Unknown:  { ID:++mmtIndex, Name:null }
        , Vectorial:{ ID:++mmtIndex, Name:null }
    }
    , Indexes: {}
};

for(var mapMatrixTypeName in window.MAP_MATRIX_TYPES.Names)
{
    MAP_MATRIX_TYPES.Names[mapMatrixTypeName].Name = mapMatrixTypeName;
    MAP_MATRIX_TYPES.Indexes[MAP_MATRIX_TYPES.Names[mapMatrixTypeName].ID] = MAP_MATRIX_TYPES.Names[mapMatrixTypeName];
}

delete mapMatrixTypeName;
delete mmtIndex;

//#endregion

//#region MapMatrix

(function() {
    try
    {
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

                if(!MyReference.Events)
                    MyReference.Events = {};
                if(!MyReference.Events.Error)
                    MyReference.Events.Error = [function(error){ window.status = error.Message; }]
                if (!MyReference.MatrixSource)
                    MyReference.MatrixSource = null;
//                /* Set PointEnd later. */
//                if (!MyReference.PointStart)
//                    MyReference.PointStart = { X: 1, Y: 1 };
//                if (!MyReference.PointStart.X)
//                    MyReference.PointStart.X = 1;
//                if (!MyReference.PointStart.Y)
//                    MyReference.PointStart.Y = 1;
//                if (!MyReference.Size)
//                    MyReference.Size = {};
//                if (!MyReference.Size.Height)
//                    MyReference.Size.Height = 2;
//                if (!MyReference.Size.Width)
//                    MyReference.Size.Width = 2;
//                /* Needs Size to set PointEnd by default. */
//                if (!MyReference.PointEnd)
//                    MyReference.PointEnd = { X: MyReference.Size.Width, Y: MyReference.Size.Height };
//                if (!MyReference.PointEnd.X)
//                    MyReference.PointEnd.X = MyReference.Size.Width;
//                if (!MyReference.PointEnd.Y)
//                    MyReference.PointEnd.Y = MyReference.Size.Height;
//                if(!MyReference.Type)
//                    MyReference.Type = window.MAP_MATRIX_TYPES.Names.Empty;

                //#endregion

                //#region Attributes

                //#region Properties

                //#endregion

                //#region Methods

                /* 
                    The property "MyReference.Public" will be used to set the public stuff 
                to the real instance.
                */
                MyReference.Public = {};

                MyReference.Public.GetMatrixJSON =
                MyReference.GetMatrixJSON = function() {
                    var matrixRet = { Matrix: [], PointEnd: { X: 1, Y: 1 }, PointStart: { X: 1, Y: 1 }, Size: { Height: 1, Width: 1 } };
                    try
                    {
                        var matrixSourceType = MyReference.GetMatrixType(MyReference.MatrixSource);

                        switch(matrixSourceType.ID)
                        {
//                            case window.MAP_MATRIX_TYPES.Names.Empty.ID:
//                            //#region Empty
//                            for (var iRow = 1; iRow <= MyReference.Size.Height; iRow++)
//                            {
//                                matrixRet[iRow] = {};

//                                for (var iCol = 1; iCol <= MyReference.Size.Width; iCol++)
//                                    matrixRet[iRow][iCol] = window.BLOCK_TYPES.Names.Clear.ID;
//                            }

//                            matrixRet[MyReference.PointEnd.Y][MyReference.PointEnd.X] = window.BLOCK_TYPES.Names.End;
//                            matrixRet[MyReference.PointStart.Y][MyReference.PointStart.X] = window.BLOCK_TYPES.Names.Start;
                            //#endregion
//                                break;
                            case window.MAP_MATRIX_TYPES.Names.JSON.ID:
                                matrixRet = MyReference.MatrixSource;
                                break;
                            case window.MAP_MATRIX_TYPES.Names.Vectorial.ID:
                                //#region Vectorial

                                matrixRet.Size.Height = MyReference.Size.Height;
                                matrixRet.Size.Width = MyReference.Size.Width;

                                for (var iRow = 1; iRow <= MyReference.Size.Height; iRow++)
                                {
                                    matrixRet.Matrix[iRow] = {};

                                    for (var iCol = 1; iCol <= MyReference.Size.Width; iCol++)
                                        matrixRet.Matrix[iRow][iCol] = window.BLOCK_TYPES.Names.Clear;
                                }

                                /* Set walls. */
                                for (var iBlock = 0; iBlock < MyReference.MatrixSource.length; iBlock++)
                                {
                                    var block = MyReference.MatrixSource[iBlock];

                                    for (var y = block.P1[0]; y <= block.P2[0]; y++)
                                        for (var x = block.P1[1]; x <= block.P2[1]; x++)
                                            matrixRet.Matrix[y][x] = window.BLOCK_TYPES.Names.Wall;
                                }

                                matrixRet.PointEnd.X = MyReference.PointEndp[1];
                                matrixRet.PointEnd.Y = MyReference.PointEnd[0];

                                matrixRet.PointStart.X = MyReference.PointStart[1];
                                matrixRet.PointStart.Y = MyReference.PointStart[0];

                                //#endregion
                                break;
                            default:
                                break;
                        }
                    }
                    catch (Error) { MyReference.Events.onError(Error); }
                    return matrixRet;
                };
                /* GetMatrixType: Return get type of the matrix object specified. */
                MyReference.GetMatrixType = function(matrix) {
                    var matrixType = MAP_MATRIX_TYPES.Names.Unknown;
                    try
                    {
                        if(matrix)
                        {
                            /* SEGUIR agregando otro tipo de map matrix que es l msma map matrix par uqe la clase se constuya d eotra map matrix como matrix source. */
                            if(matrix.Map !== undefined)
                                matrixType = MAP_MATRIX_TYPES.Names.Vectorial;
                            else if((matrix.PointStart !== undefined) && (matrix.PointEnd !== undefined))
                                matrixType = MAP_MATRIX_TYPES.Names.JSON;
                        }
                    }
                    catch (Error) { MyReference.Events.onError(Error); }
                    return matrixType;
                };
                /* GetMatrix: Return a copy of the real matrix source object. */
                MyReference.Public.GetMatrixSource = function() {
                    try
                    {
                        return Global.JSONDecode(Global.JSONEncode(MyReference.MatrixSource));
                    }
                    catch (Error) 
                    { 
                        MyReference.Events.onError(Error);
                        return null;
                    }
                };
                MyReference.Initialize = function() {
                    try
                    {
                    }
                    catch (Error) { MyReference.Events.onError(Error); }
                };
                MyReference.onError = function(error) {
                    try
                    {
                        for (var eventIndex = 0; eventIndex < MyReference.Events.Error.length; eventIndex++)
                        {
                            try
                            {
                                MyReference.Events.Error[eventIndex](error);
                            }
                            catch (Error) { console.error(Error); }
                        }
                    }
                    catch (Error) { console.error(Error); }
                };

                //#endregion

                //#endregion
            }
            catch(Error) { console.error(Error); }
        };
        PRIVATE_ATTRIBUTES_OBJECT.Constructor = function(options) {
            try
            {
                var PrivateParameters = new PRIVATE_ATTRIBUTES_OBJECT(options);

                PrivateParameters.Initialize();

                //#region Public Attributes

                for(var publicAttrib in PrivateParameters.Public)
                    this[publicAttrib] = PrivateParameters.Public[publicAttrib];

                //#endregion
            }
            catch(Error) { console.error(Error); }
        };

        //#endregion

        window.MapMatrix = PRIVATE_ATTRIBUTES_OBJECT.Constructor;
    }
    catch(Error) { console.error(Error); }
})();

//#endregion