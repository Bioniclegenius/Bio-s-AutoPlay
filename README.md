# Bio-s-AutoPlay
Autoplay script for Kitten Game, located over at http://bloodrizer.ru/games/kittens

Bookmark way:

Add a bookmark. Name it "Bio's Autoplay" or some such. Make the URL for it the following:

	javascript:(function(){var%20d=document,s=d.createElement('script');s.src='javascript:(function(){var%20d=document,s=d.createElement('script');s.src='https://raw.githubusercontent.com/Bioniclegenius/Bio-s-AutoPlay/master/AutoPlay.js';d.body.appendChild(s)';d.body.appendChild(s)
     
Click bookmark. Presto!

Alternative method to manually import code:

Open up AutoPlay.js. Copy all the text.

On the Kitten Game tab, open your javascript console - in Chrome, it's ctrl+shift+j. Google around how to do it in other browsers.
Paste the code into the console and press enter. Congratulations!

To set a goal for an item:
enter "goals.setGoal("<item name>",quantity);" into the console. For instance, to set infinite huts to be built, it'd be the following:
goals.setGoal("hut",-1);

To set a goal for a category of item:
enter "goals.setType("<category name>",quantity);" into the console. For instance, to set all religion upgrades to infinitely build, it'd be "goals.setGoal("religion",-1);".  
Viable categories:
- resource
- building
- science
- workshop
- trade
- religion
- ziggurat
- transcend
- special

## Some things to note:

- Goals are used to regulate what to make. In the case of buildings, resources, and space, setting a goal to -1 means to build it infinitely, so long as you can afford it.
- The script cannot craft resources for the first time. Just go to the workshop tab and craft a single one of any resource to allow the script to craft it.
- At the start of the game, the script will automatically click the "gather catnip" button until you have a field. The script will also start off the goal for a field at 1.
- For science and workshop upgrades, setting the goal to 1 just means to build it when it's ready. Setting it to 0 means to ignore it.
- Celestial events are automatically observed. This renders SETI unnecessary, but you may still prefer to buy it.
- Catnip is all automatically converted to wood upon being completely filled.
- Wood, minerals, and iron automatically have 25% of them converted to their secondary states (beams, slabs, and plates, respectively) when they are capped.
- Science techs and workshop upgrades are all set to be automatically built upon being afforded. You may wish to turn certain ones off. For example, thorium reactors is typically not desired unless you have a high thorium income.
- If you are not sure of the name of a goal, type "goals.res." and start typing out what the goal name is. Autocomplete should find it for you. Some common typos in built-in resource names:
	- Compendiums are "compedium"
	- Concrete is "concrate"
- The script renames overlapping resource names. For instance, there is a craft named "steel" and a science named "steel." The science, for the sake of the goal, is named "steel2" instead. Therefore, you would need "goals.setGoal("steel2",1)" to change the goal of the science, and "goals.setGoal("steel",-1)" to set the goal of the resource instead.

## Category explanations:
- Resource:
	- All basic resources are here. Resources havea couple of extra goodies - blacklisted, manVal, craftVal, and autoCraftPerc.
		- autoCraftPerc:
			- Only works for certain resources, like beams. For beams, if wood hits its cap, it'll craft beam.autoCraftPerc% of the wood into beams. Good resources for this: wood (from catnip), beams (from wood), slabs (from minerals), plates (from iron), thorium (from uranium), eludium (from obtainium), kerosene (from oil). If you set autoCraftPerc for, say, beams to 25, then 25% of your wood will be crafted into beams when it hits wood cap.
		- manVal:
			- Don't worry about this too much. Basically, a goal value of -1 means build it infinitely, but this can be slow. If you were setting scaffolds to -1, then it'd craft exactly enough beams for one scaffold, then craft the scaffold, back and forth. This is normally not a problem, unless you're generating beams faster than that. Instead, setting manVal to an arbitrarily high number would make it craft as many as possible at a time, up to that number. manVal is not modified by the code automatically.
		- blacklisted:
			- This is a good one to use. Default blacklisted materials are wood, beams, and slabs. I personally recommend also blacklisting plates. Blacklisted means that if you set a goal for something that requires it, it won't forcibly craft that resource. For instance, if you want it to build warehouses, they cost beams and slabs. Without blacklist, all your wood might be converted to beams and all your minerals to slabs to produce for the warehouses. With blacklist, in combination with autoCraftPerc, it'll wait until those resources are available normally instead of forcing them out.
		- craftVal:
			- This is the same as manVal, but is automatically managed by the code. This allows things like Observatories to be autobuilt, by setting a craftVal on scaffolds, which would then be crafted from beams.
- Building:
	- All bonfire buildings are here. Set the value to build up to however many of them you want, or -1 to build infinitely until it's capped. I recommend not using -1 for buildings that are made only with resources with no cap, like warehouses, or with arbitrarily high caps that you're more likely to waste materials on rather than capping, like harbours.
- Science:
	- All science technologies are here. Set val to 0 to not auto-research when available, anything else to auto-research. Steel has a name collision with the resource "steel," and so is named "steel2" instead.
- Workshop:
		- All workshop upgrades are here. Same as science.
- Trade:
		- All trade species are here. "Zebras" has a name collision with the resource "zebras," and so is named "zebras6" instead. In trade, set a threshhold for a minumum number of trades to send at a time there. 0 means don't send any trades. -1 or 1 mean send a caravan whenever possible. Numbers like 800 mean only send trips when it can send *at least* 800, and then send all.
- Religion:
	- This is for everything on the "Religion" tab on the "Order of the Sun" panel. It does not include the "Praise the Sun" or "Transcend" buttons. Set to -1 to build up to cap.
- Ziggurat:
	- This is for all the unicorn buildings at the top of the Religion page, on the "Ziggurats" panel. Treat like buildings.
- Transcend:
	- This is for all cryptotheology upgrades. Treat this like buildings.
- Special:
	- These are individual special cases for processes that the script can automate. All of these are off by default, and would need to  be individually enabled by goals.setGoal(special option name,1), or whatever value is necessary for them. Special options:
		- feedLevi:
			- Auto-feed the leviathans, if they're around, you have at least one necrocorn, and their energy level is less than the cap. Set to 1 for on, 0 for off.
		- autoUnicorn:
			- The script comes with a handy-dandy unicorn efficiency calculator. If you set this option to 1, it'll automatically purchase unicorn buildings in the order that provides the best bonuses. This is optimized for unicorn income only. If you want a breakdown of all the buildings and details, run "getBestUniBuilding(true);".
		- autoHunt:
			- This sends hunters whenever your catpower is full. 0 is off, 1 is on.
		- autoApoReset:
			- This will automatically reset your SR bonus into praise% points when it passes the threshhold you set. 0 is off. For instance, if you want it to reset all praise points into the Praise the Sun bonus every time your SR bonus gets to 950%, then you would use "goals.setGoal("autoApoReset",950);".
		- autoPraise:
			- Same as autoHunt, but for praising when faith is full.
		- autoShatter:
			- If this is set to 1, it will automatically shatter a time crystal (if this is an available option) when chronoheat is 0. If set to 5, it will shatter 5 at a time when chronoheat is 0. If set to 0, it won't shatter any.
		- log:
			- This is enabled (set to 1) by default. If enabled, it will output various activities the script takes to the console. If disabled (set to 0) with "goals.setGoal("log",0);", it will leave the console log alone.

## For custom code injection:
The script comes with a function called "customHook()". This is run every tick the script is run, right after craftVals are auto-calculated and right before anything is actually crafted. You may rewrite the "customHook" function with whatever code you would like. This will require Javascript knowledge. Here's an example I use casually:

	extraHook = function(){
		goals.setGoal("oil",Math.floor(gamePage.resPool.get("oil").maxValue-7500));
		goals.setGoal("uranium",Math.floor(gamePage.resPool.get("uranium").maxValue-250));
		goals.setGoal("unobtainium",Math.floor(gamePage.resPool.get("unobtainium").maxValue-1000));
		goals.setGoal("steamworks",goals.getGoal("magneto"))
	}

This one, when combined with eludium, thorium, and kerosene being set to -1, means they'll only be crafted when their requisite materials hit max value. It also locks the steamworks goal to the magneto goal, meaning I only have to change magnetos to get both up. It's handy for moving targets.

## For the person interested in various game mechanics:
I keep some personal notes and bits and pieces of code in the "Extra Notes" file. Feel free to use whatever pieces you want, but this is NOT for casual users. Don't copy the entire thing in, there are sections that aren't valid code or that are autoscript snippets for others that I wrote.
