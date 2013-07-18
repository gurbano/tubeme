var EventTypeEnum = {
	MOUSEUP : 'click',
	DRAGSTART : 'dragstart',
	DRAGEND : 'dragend',
	MOUSEMOVE : 'mousemove',
	MOUSEENTER: 'mouseenter',
	MOUSELEAVE: 'mouseleave',
	NULL : 'null'
}
function Event(event){
	var self = this;
	this.type = type;
	this.targetType = targetType;
	this.targetObject = targetObject;
	this.event = event;
}

function EventListener(){
	var self = this;
	this.event = function(eventName, ev, ctx){
		switch(eventName){
			case EventTypeEnum.DRAGEND: 
				dragend(ev,ctx);
				break;
			case EventTypeEnum.MOUSEUP: 
				switch(ev.button){
					case (0):leftclick(ev,ctx);break;
					case (1):middleclick(ev,ctx);break;
					case (2):rightclick(ev,ctx);break;									
				}
				break;
			case EventTypeEnum.MOUSEMOVE: 
				mousemove(ev,ctx);
				break;
			case EventTypeEnum.MOUSEENTER: 
				mouseenter(ev,ctx);
				break;
			case EventTypeEnum.MOUSELEAVE: 
				mouseleave(ev,ctx);
				break;
			default:
				console.warn('unhandled event: ' + eventName, ev, ctx);
				break;
		}
	}		
	return self;
}
GLOBALS.el = new EventListener();
GLOBALS.bind = function(eventName,target,context){target.on(eventName, function(event){GLOBALS.el.event(eventName, event, context);})}


/*STOP*/
Stop.prototype.dragend = function(self,event){
	GLOBALS.grid.snapObject(self.obj);
	self.forEachLine(function(line,context){line.stopDragged(context);});
}
Stop.prototype.leftclick = function(self,event){};
/*LINK ANCHOR*/
LinkAnchor.prototype.dragend = function(self,event){self.link.refresh();} //Redraw the link once the control point is dragged around
LinkAnchor.prototype.rightclick = function(self,event){self.link.removeAnchor(self);} //Remove the anchor

/*LINK*/
Link.prototype.leftclick = function(self,event){self.addAnchor(new LinkAnchor(self,event.layerX,event.layerY),true);}
Link.prototype.mouseenter = function(self,event){ document.body.style.cursor = 'pointer';}
Link.prototype.mouseleave = function(self,event){ document.body.style.cursor = 'default';}

/*POINTER*/
Pointer.prototype.mousemove = function(self,event){var p = self.grid.snapToGrid(event.layerX,event.layerY);	self.pointer.setPosition(p.x,p.y);}

function dragend(event,self){if (self.dragend){self.dragend(self,event);}else{console.warn('unhandled event: ', event, self);}};
function middleclick(event,self){if (self.middleclick){self.middleclick(self,event);}else{console.warn('unhandled event: ', event, self);}};
function leftclick(event,self){if (self.leftclick){self.leftclick(self,event);}else{console.warn('unhandled event: ', event, self);}};
function rightclick(event,self){if (self.rightclick){self.rightclick(self,event);}else{console.warn('unhandled event: ', event, self);}};
function mousemove(event,self){if (self.mousemove){self.mousemove(self,event);}else{console.warn('unhandled event: ', event, self);}};
function mouseenter(event,self){if (self.mouseenter){self.mouseenter(self,event);}else{console.warn('unhandled event: ', event, self);}};
function mouseleave(event,self){if (self.mouseleave){self.mouseleave(self,event);}else{console.warn('unhandled event: ', event, self);}};
