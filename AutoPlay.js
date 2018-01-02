autoGame = function(){
	autoPlay();
}

autoPlay = function(){
	if(autoFunc("manpower"))
		gamePage.village.huntAll();
	if(autoFunc("faith")&&goals.getGoal("faith")==0)
		gamePage.religion.praise();
	for(var x in gamePage.bld.buildingGroups)
		for(var y in gamePage.bld.buildingGroups[x].buildings){
			var building=gamePage.bld.buildingGroups[x].buildings[y];
			if(gamePage.bld.getBuildingExt(building).meta.val<goals.getGoal(building))
				autoBuild(building);
		}
	if(gamePage.bld.getBuildingExt("field").meta.val==0)
		autoClick(0,"bonfire");
	autoCraftPerc("beam",25);
	autoCraftPerc("slab",25);
	autoCraftPerc("plate",25);
	autoCraftAll("wood");
	goals.resetCraftVals();
	extraHook();
	for(var i in goals.res){
		if(goals.res[i].type=="resource"){
			if(gamePage.resPool.get(goals.res[i].name).value<goals.getGoal(goals.res[i].name))
				autoCraftMin(goals.res[i].name);
		}
		if(goals.res[i].type=="science" && !goals.metGoal(i))
			autoClick(goals.res[i].name,"science");
		if(goals.res[i].type=="workshop" && !goals.metGoal(i))
			autoClick(goals.res[i].name,"workshop");
		if(goals.res[i].type=="space" && gamePage.space.getBuilding(goals.res[i].name).val<goals.getGoal(i))
			autoClick(goals.res[i].name,"space",goals.getMaxGoal(i))
	}
	if(gamePage.calendar.observeBtn)
		gamePage.calendar.observeHandler();
}

extraHook = function(){
}

goals = {
	initialized: false,
	res: {},
	setup: function(){
		for(var i in gamePage.resPool.resources)
			this.res[gamePage.resPool.resources[i].name]={
				name: gamePage.resPool.resources[i].name,
				val: 0,
				type: "resource",
				craftVal: 0,
				manVal: 0
			};
		for(var x in gamePage.bld.buildingGroups){
			for(var y in gamePage.bld.buildingGroups[x].buildings){
				var bld=gamePage.bld.getBuildingExt(gamePage.bld.buildingGroups[x].buildings[y]);
				this.res[bld.meta.name]={
					name: bld.meta.name,
					val: 0,
					type: "building"
				};
			}
		}
		for(var i in gamePage.science.techs){
			var name=gamePage.science.techs[i].name;
			if(this.res[name]!=null)
				name=name+"2";
			this.res[name]={
				name: gamePage.science.techs[i].name,
				val: 1,
				type: "science"
			};
		}
		for(var i in gamePage.workshop.meta[0].meta){
			var name=gamePage.workshop.meta[0].meta[i].name;
			if(this.res[name]!=null)
				name=name+"3";
			this.res[name]={
				name: gamePage.workshop.meta[0].meta[i].name,
				val: 1,
				type: "workshop"
			};
		}
		for(var i in gamePage.space.meta){
			for(var j in gamePage.space.meta[i].meta){
				var name=gamePage.space.meta[i].meta[j].name;
				if(this.res[name]!=null)
					name=name+"4";
				this.res[name]={
					name: gamePage.space.meta[i].meta[j].name,
					val: 0,
					type: "space"
				};
			}
		}
		this.res.field.val=1;
		this.initialized=true;
	},
	getGoal: function(resource){
		if(!this.initialized)
			this.setup();
		if(this.res[resource]!=undefined){
			if(this.res[resource].type=="building" && this.res[resource].val==-1)
				return gamePage.bld.getBuildingExt(resource).meta.val+1;
			if(this.res[resource].type=="resource"){
				var tempVal=this.res[resource].val;
				if(this.res[resource].val==-1)
					tempVal=gamePage.resPool.get(resource).value+1;
				if(tempVal<this.res[resource].craftVal)
					tempVal=this.res[resource].craftVal;
				if(tempVal<this.res[resource].manVal)
					tempVal=this.res[resource].manVal;
				return tempVal;
			}
			if(this.res[resource].type=="science" && this.res[resource].val==-1)
				return 1;
			if(this.res[resource].type=="space" && this.res[resource].val==-1)
				return gamePage.space.getBuilding(this.res[resource].name).val+1;
			return this.res[resource].val;
		}
		return 0;
	},
	getRealGoal: function(resource){
		if(!this.initialized)
			this.setup();
		if(this.res[resource]!=undefined){
			if(this.res[resource].type=="building" && this.res[resource].val==-1)
				return 0;
			if(this.res[resource].type=="resource" && this.res[resource].val==-1)
				return 0;
			if(this.res[resource].type=="science" && this.res[resource].val==-1)
				return 0;
			if(this.res[resource].type=="space" && this.res[resource].val==-1)
				return 0;
			return this.res[resource].val;
		}
		return 0;
	},
	setGoal: function(resource,value){
		if(!this.initialized)
			this.setup();
		if(this.res[resource]!=undefined)
			this.res[resource].val=value;
		return this.res[resource];
	},
	metGoal: function(resource){
		if(!this.initialized)
			this.setup();
		if(this.res[resource]!=undefined){
			if(this.res[resource].type=="resource"){
				if(gamePage.resPool.get(this.res[resource].name).value>=this.getRealGoal(resource))
					return true;
				return false;
			}
			if(this.res[resource].type=="building"){
				if(gamePage.bld.getBuildingExt(this.res[resource].name).meta.val>=this.res[resource].val)
					return true;
				return false;
			}
			if(this.res[resource].type=="science"){
				if(this.res[resource].val>0){
					for(var i in gamePage.science.techs)
						if(gamePage.science.techs[i].name==this.res[resource].name)
							return gamePage.science.techs[i].researched;
				}
				return true;
			}
			if(this.res[resource].type=="workshop"){
				if(this.res[resource].val>0){
					for(var i in gamePage.workshop.meta[0].meta)
						if(gamePage.workshop.meta[0].meta[i].name==this.res[resource].name)
							return gamePage.workshop.meta[0].meta[i].researched;
				}
				return true;
			}
			if(this.res[resource].type=="space"){
				if(this.res[resource].val>0){
					if(gamePage.space.getBuilding(this.res[resource].name).val<this.getRealGoal(resource))
						return false;
				}
				return true;
			}
		}
		return true;
	},
	resetCraftVals: function(){
		if(!this.initialized)
			this.setup();
		for(var i in this.res){
			if(this.res[i].type=="resource")
				this.res[i].craftVal=0;
		}
		var changed=true;
		var blacklist=['wood','beam','slab']
		while(changed){
			changed=false;
			for(var i in this.res){
				if(this.res[i].type=="resource"){
					if(this.getGoal(i)>gamePage.resPool.get(this.res[i].name).value){
						var craft=gamePage.workshop.getCraft(this.res[i].name);
						if(craft!=null){
							for(var j in craft.prices){
								var price={
									name: craft.prices[j].name,
									val: craft.prices[j].val
								};
								price.val=Math.ceil(price.val*1000)/1000;
								if(gamePage.workshop.getCraft(price.name)!=null&&blacklist.indexOf(price.name)==-1)
									if(this.getGoal(price.name)-this.getRealGoal(price.name)<price.val&&this.res[price.name].val>=0){
										this.res[price.name].craftVal=price.val+this.getRealGoal(price.name);
										changed=true;
									}
							}
						}
					}
				}
				if(this.res[i].type=="building"){
					if(this.getGoal(i)>gamePage.bld.getBuildingExt(this.res[i].name).meta.val){
						var prices=gamePage.bld.getPrices(this.res[i].name);
						if(prices!=null){
							var canBuild=true;
							for(var j in prices){
								var price={
									name: prices[j].name,
									val: prices[j].val
								};
								if(gamePage.resPool.get(price.name)!=null)
									if(price.val>gamePage.resPool.get(price.name).maxValue&&gamePage.resPool.get(price.name).maxValue>0&&price.val>gamePage.resPool.get(price.name).value){
										canBuild=false;
										break;
									}
							}
							if(canBuild){
								for(var j in prices){
									var price={
										name: prices[j].name,
										val: prices[j].val
									};
									price.val=Math.ceil(price.val*1000)/1000;
									if(gamePage.workshop.getCraft(price.name)!=null&&blacklist.indexOf(price.name)==-1)
										if(this.getGoal(price.name)<price.val&&this.res[price.name].val>=0){
											this.res[price.name].craftVal=price.val;
											changed=true;
										}
								}
							}
						}
					}
				}
				if(this.res[i].type=="space"){
					if(this.getGoal(i)>gamePage.space.getBuilding(this.res[i].name).val){
						var prices=gamePage.space.getBuilding(this.res[i].name).prices;
						if(prices!=null){
							var priceRatio=gamePage.space.getBuilding(this.res[i].name).priceRatio;
							var reductionRatio = game.getHyperbolicEffect(game.getEffect("oilReductionRatio"), 0.75);
							var num=gamePage.space.getBuilding(this.res[i].name).val;
							for(var j in prices){
								var price={
									name: prices[j].name,
									val: prices[j].val
								};
								if(price.name!=="oil"){
									price.val*=Math.pow(priceRatio,num);
								}
								else{
									price.val*=Math.pow(1.05,num);
									price.val*=(1-reductionRatio);
								}
								price.val=Math.ceil(price.val*1000)/1000;
								if(gamePage.workshop.getCraft(price.name)!=null&&blacklist.indexOf(price.name)==-1)
									if(this.getGoal(price.name)<price.val&&this.res[price.name].val>=0){
										this.res[price.name].craftVal=price.val;
										changed=true;
									}
							}
						}
					}
				}
			}
		}
	},
	getMaxGoal: function(resource){
		if(!this.initialized)
			this.setup();
		if(this.res[resource]==undefined)
			return 0;
		var val=this.res[resource].val;
		if(val==-1)
			return Infinity;
		var tempVal=0;
		if(this.res[resource].craftVal!=undefined)
			tempVal=this.res[resource].tempVal;
		val=Math.max(val,tempVal);
		if(this.res[resource].manVal!=undefined)
			tempVal=this.res[resource].manVal;
		val=Math.max(val,tempVal);
		return val;
	}
}

autoFunc = function(resource){
	var res=gamePage.resPool.get(resource);
	return (res.value>=res.maxValue);
}

autoCraftMin = function(resource){
	var res=gamePage.workshop.getCraft(resource);
	if(res!=null){
		var prices=gamePage.workshop.getCraftPrice(res);
		var canCraft=gamePage.resPool.get(resource).unlocked;
		if(res.value==res.maxValue)
			canCraft=false;
		var res0name=prices[0].name;
		var maxCount=Math.floor((gamePage.resPool.get(res0name).value-goals.getRealGoal(res0name))/prices[0].val);
		for(var i=0;i<prices.length;i++){
			if(gamePage.resPool.get(prices[i].name).value-goals.getRealGoal(prices[i].name)<prices[i].val)
				canCraft=false;
			var thisPrice=Math.floor((gamePage.resPool.get(prices[i].name).value-goals.getRealGoal(prices[i].name))/prices[i].val);
			if(thisPrice<maxCount)
				maxCount=thisPrice;
		}
		if(canCraft&&maxCount>0){
			if((goals.res[resource].val>0||goals.res[resource].craftVal>0||goals.res[resource].manVal>0)
				&&maxCount>Math.ceil((goals.getGoal(resource)-gamePage.resPool.get(resource).value)/(gamePage.workshop.game.getResCraftRatio(resource)+1)))
				maxCount=Math.ceil((goals.getGoal(resource)-gamePage.resPool.get(resource).value)/(gamePage.workshop.game.getResCraftRatio(resource)+1))
			gamePage.workshop.craft(resource,maxCount);
		}
	}
}

autoCraftAll = function(resource){
	var res=gamePage.workshop.getCraft(resource);
	var prices=gamePage.workshop.getCraftPrice(res);
	var canCraft=gamePage.resPool.get(resource).unlocked;
	if(resource=="wood")
		canCraft=true;
	if(res.value==res.maxValue)
		canCraft=false;
	for(var i=0;i<prices.length;i++){
		if(!autoFunc(prices[i].name))
			canCraft=false;
	}
	if(canCraft){
		gamePage.workshop.craftAll(resource);
	}
}

autoCraftPerc = function(resource,percent){
	var res=gamePage.workshop.getCraft(resource);
	var prices=gamePage.workshop.getCraftPrice(res);
	var canCraft=gamePage.resPool.get(resource).unlocked;
	if(res.value==res.maxValue)
		canCraft=false;
	for(var i=0;i<prices.length;i++){
		if(!autoFunc(prices[i].name))
			canCraft=false;
		if(Math.floor(gamePage.resPool.get(prices[i].name).maxValue*percent/100.0/prices[i].val<1))
			canCraft=false;
	}
	var res2=gamePage.resPool.get(prices[0].name);
	if(canCraft){
		gamePage.workshop.craft(resource,Math.floor(res2.maxValue*percent/100.0/prices[0].val));
	}
}

autoBuild = function(building){
	var prices=gamePage.bld.getPrices(building);
	var canBuild=gamePage.bld.getBuildingExt(building).meta.unlocked;
	for(var i=0;i<prices.length;i++){
		var res=gamePage.resPool.get(prices[i].name);
		if(res.value<prices[i].val)
			canBuild=false;
	}
	if(!gamePage.bld.getBuildingExt(building).meta.unlocked)
		canBuild=false;
	if(canBuild){
		btns=gamePage.tabs[0].buttons;
		for(var i=2;i<btns.length;i++){
			if(btns[i].model.metadata.name==building)
				autoClick(i,"bonfire",goals.getMaxGoal(building));
		}
	}
	return canBuild;
}

autoClick = function(buttonName,tabName="bonfire",goal=0){
	var curTab = gamePage.ui.activeTabId;
	var tab=-1;
	var button=-1;
	if(typeof(tabName)=="string"){
		for(var i in gamePage.tabs)
			if(gamePage.tabs[i].tabName.toLowerCase()==tabName.toLowerCase())
				tab=i;
	}
	else if(typeof(tabName)=="number"){
		if(tabName>=0 && tabName<gamePage.tabs.length)
			tab=tabName;
	}
	if(tab>=0){
		if(typeof(buttonName)=="string"){
			if(gamePage.tabs[tab].tabName.toLowerCase()!="space"){
				for(var i in gamePage.tabs[tab].buttons)
					if(gamePage.tabs[tab].buttons[i].id.toLowerCase()==buttonName.toLowerCase())
						button=i;
			}
			else{
				var tempButtons = gamePage.tabs[tab].GCPanel.children;
				for(var i in gamePage.tabs[tab].planetPanels)
					tempButtons=tempButtons.concat(gamePage.tabs[tab].planetPanels[i].children);
				for(var i in tempButtons)
					if(tempButtons[i].id.toLowerCase()==buttonName.toLowerCase())
						button=i;
			}
		}
		else if(typeof(buttonName)=="number"){
			if(buttonName>=0 && buttonName<gamePage.tabs[tab].buttons.length)
				button=buttonName;
		}
		if(button>=0){
			var btns=gamePage.tabs[tab].buttons;
			if(gamePage.tabs[tab].tabName.toLowerCase()=="space"){
				btns=gamePage.tabs[tab].GCPanel.children;
				for(var i in gamePage.tabs[tab].planetPanels)
					btns=btns.concat(gamePage.tabs[tab].planetPanels[i].children);
			}
			var prices=btns[button].model.prices;
			var canBuy=true;
			for(var i in prices)
				if(gamePage.resPool.get(prices[i].name).value<prices[i].val)
					canBuy=false;
			if(btns[button].model.visible==false)
				canBuy=false;
			if(btns[button].enabled==false)
				canBuy=false;
			if(canBuy){
				if(curTab!=gamePage.tabs[tab].tabId){
					gamePage.ui.activeTabId = gamePage.tabs[tab].tabId;
					gamePage.ui.render();
				}
				btns[button].controller.buyItem(btns[button].model,1,
					function(result){
						if(result){
							btns[button].update();
							if(btns[button].model.name!=undefined){
								console.log(btns[button].model.name+" ("+gamePage.tabs[tab].tabName+")"+(goal!=0?" goal: "+goal:""));
								if(tab!=0)
									console.log("\t"+btns[button].model.description.replace("<br>","\n\t"))
							}
						}
					});
				if(curTab!=gamePage.ui.activeTabId)
					gamePage.ui.activeTabId=curTab;
				gamePage.ui.render();
				return true;
			}
		}
	}
	if(curTab != gamePage.ui.activeTabId){
		gamePage.ui.activeTabId = curTab;
		gamePage.ui.render();
	}
	return false;
}

gamePage.timer.addEvent(autoGame,1);
