Array.prototype.insert = function (index, item) {
  return this.splice(index, 0, item);
};
var $time = function() {return +new Date;};
function Point(x,y){
	this.x = x;
	this.y = y;
}


var LINK_WIDTH = 5;

function LinkAnchor(parentLink,_x,_y, visibility){
	var self = this;
	this.link = parentLink;
	this.id = $time();
	this.obj =  new Kinetic.Circle({
		x: _x,
		y: _y,
		radius: 4,
		fill: 'black',
		strokeWidth: 1,
		stroke: 'black',
		draggable: true,
		id : 'anchor_'+ parentLink.points.length,
		link : parentLink,
		visible : visibility
		
	}); 
	this.getPoint = function(){
		return new Point(this.obj.getX(),this.obj.getY());
	}
	this.moveTo = function(x,y){
		this.obj.move(x-this.obj.getX(),y-this.obj.getY());
		if(this.obj.getStage()){this.obj.getStage().draw();}
	}
	
	GLOBALS.bind('dragend',this.obj, self);
	GLOBALS.bind('click',this.obj, self);
	return this.id;
}
function Link(line,stop1, stop2){
	var self = this;
	this.points = new Array(); //Array<linkAnchor>
	this.line = line;
	this.stop1 = stop1;
	this.stop2 = stop2;
	this.init = function(){
		
	}
	this.removeAnchor = function(anchorToDelete){
		this.points.splice( this.points.indexOf(anchorToDelete) ,1);
		anchorToDelete.obj.remove();
		anchorToDelete = null;
		this.refresh();
	}
	this.addAnchor = function(linkAnchor){
		var size = this.points.length;
		if (size<2){
			this.points.push(linkAnchor);
		}else if (size<4){
			this.points.push(this.points[size-1]);
			this.points[size-1]=linkAnchor;
			this.line.linksLayer.add(linkAnchor.obj);
			this.refresh();	
		}	
	}
	// Automatically add anchors on creation
	this.addAnchor(new LinkAnchor(self,stop1.x(),stop1.y(), false));
	this.addAnchor(new LinkAnchor(self,stop2.x(),stop2.y(), false));
	this._id = function(){return this.line.id+"_"+this.stop1.id+"_"+this.stop2.id;}
	this.id = this._id();
	this.getSplinePoints = function(){
		var ret = new Array();
		for (var i=0; i<this.points.length; i++){
			ret.push({x: this.points[i].getPoint().x, y: this.points[i].getPoint().y });
		}
		return ret;
	};
	this.obj =  new Kinetic.Spline({
		points: this.getSplinePoints(),
		stroke: line.color,
        strokeWidth: LINK_WIDTH,
        lineCap: 'round',
        tension: 0.5,
		id : this.id
	});
	
	this.connectStop = function(id){
		return (this.stop1.id === id) || (this.stop2.id === id);
	};
	this.refresh = function(){
		this.points[0].moveTo(stop1.x(),stop1.y());
		this.points[this.points.length-1].moveTo(stop2.x(),stop2.y());
		this.obj.setPoints(this.getSplinePoints());
		this.line.linksLayer.draw();
	}
	this.forEachAnchor = function(callback){
		for(var i=0; i<self.points.length; i++){
			callback(self.points[i],self);
		}
	};
	
	GLOBALS.bind('click',this.obj, self);
	GLOBALS.bind('mouseenter',this.obj, self);
	GLOBALS.bind('mouseleave',this.obj, self);
	
}
function Stop(line, name,x,y){
	var SIMPLE_STATION_RADIUS = 5;
	var END_STATION_RADIUS = 6;
	var SWITCH_STATION_RADIUS = 10;
	var self = this;
	this.lines = new Array();
	this.lines.push(line);
	this.name = name;
	this._id = function(){return "_STOP_"+this.name;}
	this.id = this._id();
	this.type = "END";
	this.setType = function(type){
		this.type=type;
	}
	this.nextStop = undefined;
	this.setNext = function(stop){
		this.nextStop = stop;
	}
	this.styleLen = LINK_WIDTH*2;
	this.drawName = function(context){
		context.font = "small-caps lighter 16px arial";
		context.fillText(this.name, 10, -10);
	}
	this.obj = new Kinetic.Shape({
		x: x,
		y: y,
		draggable:true,
		drawFunc: function(canvas){			
			var context = canvas.getContext();					
			switch(self.type){
				case 'SIMPLE_LINE': 								
					context.beginPath();	
					context.moveTo(0, 0);
					if (self.nextStop){
						var pos1 = self.obj.getAbsolutePosition();
						var pos2 = self.nextStop.obj.getAbsolutePosition();
						
						var slope = ((pos1.y - pos2.y)/(pos1.x - pos2.x));
						var p_slope = -1/slope;
						
						var end = new Point(self.styleLen,self.styleLen*p_slope);
						console.info(end)
						context.lineTo(end.x,end.y);
					}else{
						context.lineTo(self.styleLen,-self.styleLen);
					}
					context.lineWidth = LINK_WIDTH;
					context.strokeStyle = self.lines[0].color;
					canvas.stroke(this);
					self.drawName(context);
					break;
				case 'SIMPLE': 
					context.beginPath();	
					context.arc(0, 0, SIMPLE_STATION_RADIUS, 0, 2 * Math.PI);					
					context.closePath();
					canvas.fillStroke(this);
					self.drawName(context);
					canvas.stroke(this);
					break;
				case 'END': 
					context.beginPath();	
					context.arc(0, 0, END_STATION_RADIUS, 0, 2 * Math.PI);					
					context.closePath();
					canvas.fillStroke(this);
					self.drawName(context);
					break;
				case 'SWITCH': 
					context.beginPath();	
					context.arc(0, 0, SWITCH_STATION_RADIUS, 0, 2 * Math.PI);					
					context.closePath();
					canvas.fillStroke(this);
					self.drawName(context);
					break;
			}			
			
		},
		drawHitFunc: function(canvas) {
          var context = canvas.getContext();
          context.beginPath();
          context.arc(0, 0, 10, 0, Math.PI * 2, true);
          context.closePath();
          canvas.fillStroke(this);
        },
		fill: 'white',
		stroke: 'black',
		strokeWidth: 1,
		draggable: true,
		id : this.id,
		stop : this
	});
	//GLOBALS.bind('click',this.obj,self);
	this.x = function(){return this.obj.attrs.x;}
	this.y = function(){return this.obj.attrs.y;}
	this.getPoint = function(){return new Point(this.x(),this.y())};
	this.forEachLine = function(callback){
		for(var i=0; i<self.lines.length; i++){
			callback(self.lines[i],self);
		}
	};
	GLOBALS.bind('dragend',this.obj,self);
	GLOBALS.bind('click',this.obj, self);

}
function Line(metro, name, color){
	var self = this;
	this.metro = metro;
	this.stopsLayer = new Kinetic.Layer();
	this.linksLayer = new Kinetic.Layer();
	this.name = name;
	this.stops = new Array();
	this.links = new Array();
	this.color = color || "red";
	this._id = function(){return "LINE_"+this.name;}
	this.id = this._id();	
	this.forEachStop = function(callback){
		for(var i=0; i<self.stops.length; i++){
			callback(self.stops[i],self);
		}
	};
	this.forEachLink = function(callback){
		for(var i=0; i<self.links.length; i++){
			callback(self.links[i],self);
		}
	};
	this.stopDragged = function(stop){
		this.forEachLink(function(link,context){
			if (link.connectStop(stop.id)){
				link.refresh();
			}		
		});
		//this.linksLayer.draw();
	};	
	this.recomputeStopTypes = function(){
		/*SET STOPS TYPES*/
		this.forEachStop(function(stop, context){
			stop.setType('SIMPLE');
			/*If the stop is connected to more than one line then it's a switch*/
			if (stop.lines.length>1){
				stop.setType('SWITCH');
			}
		});
		this.getLastStop().setType('END');
		this.getFirstStop().setType('END');
	}	
	this.addStop = function(name,x,y){
		var tmp = new Stop(this, name,x,y); //Create the stop
		this.stops.push(tmp); //Push it in the stops array
		if (this.getLastStop() && this.getBeforeLastStop()){this.linkStops(this.getLastStop(),this.getBeforeLastStop());} //Automatically link to last station
		this.stopsLayer.add(tmp.obj); //Add to layer
		this.recomputeStopTypes();//recompute stop types	
		this.stopsLayer.draw(); //redraw
		return tmp;
	}
	this.pushStop =function(stop){
		stop.lines.push(this); //Add the line
		this.stops.push(stop); //Push it in the stops array
		if (this.getLastStop() && this.getBeforeLastStop()){
			this.linkStops(this.getLastStop(),this.getBeforeLastStop());
		} //Automatically link to last station
		this.stopsLayer.add(stop.obj); //Add to layer
		this.recomputeStopTypes();//recompute stop types	
		this.stopsLayer.draw(); //redraw
		return stop;
	}
	this.linkStops = function(stop1, stop2){
		var tmp = new Link(this,stop1,stop2);
		this.links.push(tmp);
		this.linksLayer.add(tmp.obj);
		tmp.forEachAnchor(function(anchorPoint,context){
			self.linksLayer.add(anchorPoint.obj);
		});
		stop1.setNext(stop2);
		this.linksLayer.draw();
		return tmp;		
	}
	this.getLastStop = function(){
		if (this.stops.length>0){ return this.stops[this.stops.length-1]}
		else return undefined;
	}
	this.getFirstStop = function(){
		if (this.stops.length>0){ return this.stops[0]}
		else return undefined;
	}
	this.getBeforeLastStop = function(){
		if (this.stops.length>1){ return this.stops[this.stops.length-2]}
		else return undefined;
	}
}
function Metro(name, stage){
	var self = this;
	this.stage = stage;
	this.name = name;
	this.stateManager = new StateManager();
	this.lines = {};
	/*GRID*/
	this.backLayer = new Kinetic.Layer();
	this.grid = new Grid(this.stage,this.backLayer);
	GLOBALS.bind('click',this.grid.backRect, self);		
	this.stage.add(this.backLayer);
	this.addLine = function(name, color){
		var tmp = new Line(this,name, color);
		this.lines.name = tmp;
		stage.add(tmp.linksLayer);
		stage.add(tmp.stopsLayer);		
		return tmp;
	}
	this.getLine = function(name){return lines[name];}	
	this.stateManager.changeState(StateEnum.START);
	//setInterval(function(){stage.draw();},1000/60);
	this.draw = function () {
		requestAnimationFrame(self.draw);
		self.stage.draw();
	}
}





