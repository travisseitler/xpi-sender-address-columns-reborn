/*
|  SenderAddressColumn Add-on for Thunderbird
|  Copyright (C) 2014 D. Antoni.
|  
|  This program is free software: you can redistribute it and/or modify
|  it under the terms of the GNU General Public License as published by
|  the Free Software Foundation, either version 3 of the License, or
|  (at your option) any later version.
|
|  This program is distributed in the hope that it will be useful,
|  but WITHOUT ANY WARRANTY; without even the implied warranty of
|  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
|  GNU General Public License for more details.
|
|  You should have received a copy of the GNU General Public License
|  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
	
function SenderAddressColumn() 
{
    this.sTreeColName  = 'colSenderAddress';	
    this.PATTERN       = /\b(?:.+)@(?:.+)\b/ ;
	this.STRICTPATTERN = /((?:\b[a-zA-Z0-9._%+-]+)@(?:(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}))\b/ ;
}


SenderAddressColumn.prototype = 
{
    constructor: SenderAddressColumn,
   
    init: function() 
	{
        this.Cc = Components.classes;
        this.Ci = Components.interfaces;
      
        this.initialized 	= true;   

	    // fetch services
        this.oServiceHdrParser = Cc["@mozilla.org/messenger/headerparser;1"].getService(Ci.nsIMsgHeaderParser);   
        this.oServiceObserver  = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
		  
	    // register observer	
	    this.oServiceObserver.addObserver(this, "MsgCreateDBView", false);	
	},
		
	_getAddress: function (oDecodedAddress) 
    {
	   var addresses = {};
	   var names = {};
	   this.oServiceHdrParser.parseHeadersWithArray(oDecodedAddress, addresses, names, {});
	   return (addresses.value);   
    },
   
	_getUnfilteredColumnData: function (oHdr) 
	{
	   return this._getAddress (oHdr.mime2DecodedAuthor);
    },
  	
	_getFilteredColumnData: function (oHdr) 
    { 		
		var sData         = this._getUnfilteredColumnData (oHdr);   
	    var sMatch        = this.PATTERN.exec(sData);	
	    var bStrictMatch  = this.STRICTPATTERN.test(sData);
    	 
	    if (! bStrictMatch) { return ("[" + sMatch[1] + "]"); }
	    else                { return (sMatch[1]); }
    },
	
	_getColumnData: function (oHdr) 
	{
	   return this._getUnfilteredColumnData (oHdr);
    },
	
	
   // ### nsIObserver Method ###

   observe: function (subject, sTopic, wsData)
   {  
        gDBView.addColumnHandler(this.sTreeColName, this);
   },

 
   // ### nsITreeView Methods ###
   
   // *** Called on the view when a cell in a non-selectable 
   // ** cycling column (for example, unread/flag/and so on.) is clicked.
   
   cycleCell: function(iRow, iCol) {},
	  
	  
   // *************
   // *** A whitespace delimited list of properties for a given cell.  Each
   // *** property, x, that the view gives back will cause the pseudoclasses
   // *** ::-moz-tree-cell(x), ::-moz-tree-row(x), ::-moz-tree-twisty(x),
   // *** ::-moz-tree-image(x), ::-moz-tree-cell-text(x). to be matched on the
   // *** cell.
   
   getCellProperties: function (iRow, iCol, aProps) { return ""; },
   

   // *************
   // *** A whitespace delimited list of properties.  For each property X the view
   // *** gives back will cause the pseudoclasses  ::-moz-tree-cell(x),
   // *** ::-moz-tree-row(x), ::-moz-tree-twisty(x), ::-moz-tree-image(x),
   // *** ::-moz-tree-cell-text(x).  to be matched on the pseudoelement
   // *** ::moz-tree-row.
   
   getRowProperties: function (iRow, aProps) { return ""; },
   
   
   // *************
   // *** The image path for a given cell. For defining an icon for a cell. 
   // *** If the empty string is returned, the 
   // *** ::moz-tree-image pseudoelement will be used.
   
   getImageSrc: function (iRow, iCol) {},


    // *************
    // *** Called to ask the view if the cell contents are editable.
    // *** A value of true will result in the tree popping up a text field 
	// *** when the user tries to inline edit the cell.
   
   isEditable: function (iRow, iCol) { return false; },

   
   // *************
   // *** The text for a given cell. If a column consists only 
   // *** of an image, then the empty string is returned.
   
   getCellText: function (iRow, iCol) 
   {
      //get the message's header 
	  var iKey = gDBView.getKeyAt(iRow);   
	  var oHdr = gDBView.getFolderForViewIndex(iRow).GetMessageHeader(iKey);
	     
      //extract the sender's address from the header 
      return this._getColumnData(oHdr);
   },


   // ### nsIMsgCustomColumnHandler Methods ###
  
   // *************
   // *** If the column displays a string, this will return the string 
   // *** that the column should be sorted by.
   
   getSortStringForRow: function (oHdr) 
   {
	  //extract the sender's address from the header 
	  return this._getColumnData(oHdr);
   },
 
 
   // *************
   // *** If the column displays a number, this will return the number 
   // *** that the column should be sorted by.
   
   getSortLongForRow: function (oHdr) { return null; },


   // *************
   // *** Returns true if the column displays a string value, false otherwise.
   // *** This affects whether getSortStringForRow or getSortLongForRow 
   // *** is used to determine the sort key for the column. It does not 
   // *** affect whether getCellText vs. getImageSrc is used to determine
   // *** what to display.
   
   isString: function ()  { return true; },
  
}


var inheritPrototype = (function () {
    // Return new "class" built with copy of input object's prototype  
    function Obj() {};

    return function ($oProto) 
	{
        Obj.prototype = $oProto.prototype;
        return new Obj;
    };
}());


// ------  Sender Domain column -------
function SenderAddressColumn_Domain () 
{
    this.sTreeColName  = 'colSenderDomain';
    this.PATTERN       = /\b(?:.+)@(.+)\b/ ;
	this.STRICTPATTERN = /(?:\b[a-zA-Z0-9._%+-]+)@((?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6})\b/ ;
}
SenderAddressColumn_Domain.prototype = inheritPrototype(SenderAddressColumn);
SenderAddressColumn_Domain.prototype._getColumnData = function (oHdr) 
{
	return SenderAddressColumn.prototype._getFilteredColumnData.call (this, oHdr);   
}

// ------  Sender Username column -------
function SenderAddressColumn_Username () 
{
    this.sTreeColName  = 'colSenderUsername';
	this.PATTERN       = /\b(.+)@(?:.+)\b/ ;
	this.STRICTPATTERN = /(\b[a-zA-Z0-9._%+-]+)@(?:(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6})\b/ ;
}
SenderAddressColumn_Username.prototype = inheritPrototype(SenderAddressColumn);
SenderAddressColumn_Username.prototype._getColumnData = function (oHdr) 
{ 
	return SenderAddressColumn.prototype._getFilteredColumnData.call (this, oHdr);   
}


window.addEventListener("load", function () { new SenderAddressColumn().init(); }, false);
window.addEventListener("load", function () { new SenderAddressColumn_Domain().init(); }, false);
window.addEventListener("load", function () { new SenderAddressColumn_Username().init(); }, false);
