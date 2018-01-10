# Bio-s-AutoPlay
Autoplay script for Kitten Game, located over at http://bloodrizer.ru/games/kittens

Open up AutoPlay.js. Copy all the text.

On the Kitten Game tab, open your javascript console - in Chrome, it's ctrl+shift+j. Google around how to do it in other browsers.\\
Paste the code into the console and press enter. Congratulations!

To set a goal for an item:\\
enter "goals.setGoal("<item name>",quantity);" into the console. For instance, to set infinite huts to be built, it'd be the following:\\
    goals.setGoal("hut",-1);

To set a goal for a category of item:\\
enter "goals.setType("<category name>",quantity);" into the console. For instance, to set all religion upgrades to infinitely build, it'd\\
&nbsp;&nbsp;&nbsp;&nbsp;be "goals.setGoal("religion",-1);".\\
&nbsp;&nbsp;&nbsp;&nbsp;Viable categories:\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;resource\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;building\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;science\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;workshop\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;trade\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;religion\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ziggurat\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;transcend\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;special\\

Some things to note:

 - Goals are used to regulate what to make. In the case of buildings, resources, and space, setting a goal to -1 means to build it\\
    infinitely, so long as you can afford it.
 - The script cannot craft resources for the first time. Just go to the workshop tab and craft a single one of any resource to allow\\
    the script to craft it.
 - At the start of the game, the script will automatically click the "gather catnip" button until you have a field. The script will also\\
    start off the goal for a field at 1.
 - For science and workshop upgrades, setting the goal to 1 just means to build it when it's ready. Setting it to 0 means to ignore it.\\
 - Hunters will automatically be sent to hunt all upon reaching the catpower cap. However, mind the wiki - mints are more powerful\\
    than hunters at certain points. Keep in mind you may still desire catpower for trades.
 - Faith will automatically be praised upon reaching the faith cap. If you want to buy a religion upgrade, buy it before your faith is\\
    autopraised.
 - Celestial events are automatically observed. This renders SETI unnecessary, but you may still prefer to buy it.
 - Catnip is all automatically converted to wood upon being completely filled.
 - Wood, minerals, and iron automatically have 25% of them converted to their secondary states (beams, slabs, and plates, respectively)\\
    when they are capped.
 - Science techs and workshop upgrades are all set to be automatically built upon being afforded. You may wish to turn certain ones off.\\
    For example, thorium reactors is typically not desired unless you have a high thorium income.
 - If you are not sure of the name of a goal, type "goals.res." and start typing out what the goal name is. Autocomplete should find it\\
    for you. Some common typos in built-in resource names:
      - Compendiums are "compedium"
      - Concrete is "concrate"
 - The script renames overlapping resource names. For instance, there is a craft named "steel" and a science named "steel." The science,\\
    for the sake of the goal, is named "steel2" instead. Therefore, you would need "goals.setGoal("steel2",1)" to change the goal\\
    of the science, and "goals.setGoal("steel",-1)" to set the goal of the resource instead.
&nbsp;&nbsp;&nbsp;&nbsp;
Category explanations:
&nbsp;&nbsp;&nbsp;&nbsp;Resource:
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;All basic resources are here. Resources havea couple of extra goodies - blacklisted, manVal, craftVal, and autoCraftPerc.\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;autoCraftPerc:\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Only works for certain resources, like beams. For beams, if wood hits its cap, it'll craft beam.autoCraftPerc% of the wood\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;into beams. Good resources for this: wood (from catnip), beams (from wood), slabs (from minerals), plates (from iron),\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;thorium (from uranium), eludium (from obtainium), kerosene (from oil).\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;If you set autoCraftPerc for, say, beams to 25, then 25% of your wood will be crafted into beams when it hits wood cap.\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;manVal:\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Don't worry about this too much. Basically, a goal value of -1 means build it infinitely, but this can be slow. If you were\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;setting scaffolds to -1, then it'd craft exactly enough beams for one scaffold, then craft the scaffold, back and forth.\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;This is normally not a problem, unless you're generating beams faster than that. Instead, setting manVal to an arbitrarily\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;high number would make it craft as many as possible at a time, up to that number. manVal is not modified by the code\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;automatically.\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;blacklisted:\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;This is a good one to use. Default blacklisted materials are wood, beams, and slabs. I personally recommend also blacklisting\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;plates. Blacklisted means that if you set a goal for something that requires it, it won't forcibly craft that resource. For\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;instance, if you want it to build warehouses, they cost beams and slabs. Without blacklist, all your wood might be converted\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;to beams and all your minerals to slabs to produce for the warehouses. With blacklist, in combination with autoCraftPerc,\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;it'll wait until those resources are available normally instead of forcing them out.\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;craftVal:\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;This is the same as manVal, but is automatically managed by the code. This allows things like Observatories to be autobuilt,\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;by setting a craftVal on scaffolds, which would then be crafted from beams.\\
&nbsp;&nbsp;&nbsp;&nbsp;Building:\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;All bonfire buildings are here. Set the value to build up to however many of them you want, or -1 to build infinitely until it's\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;capped. I recommend not using -1 for buildings that are made only with resources with no cap, like warehouses, or with arbitrarily\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;high caps that you're more likely to waste materials on rather than capping, like harbours.\\
&nbsp;&nbsp;&nbsp;&nbsp;Science:\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;All science technologies are here. Set val to 0 to not auto-research when available, anything else to auto-research. Steel has a\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;name collision with the resource "steel," and so is named "steel2" instead.\\
&nbsp;&nbsp;&nbsp;&nbsp;Workshop:\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;All workshop upgrades are here. Same as science.\\
&nbsp;&nbsp;&nbsp;&nbsp;Trade:\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;All trade species are here. "Zebras" has a name collision with the resource "zebras," and so is named "zebras6" instead. In trade,\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;set a threshhold for a minumum number of trades to send at a time there. 0 means don't send any trades. -1 or 1 mean send a\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;caravan whenever possible. Numbers like 800 mean only send trips when it can send *at least* 800, and then send all.\\
&nbsp;&nbsp;&nbsp;&nbsp;Religion:\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;This is for everything on the "Religion" tab on the "Order of the Sun" panel. It does not include the "Praise the Sun" or\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"Transcend" buttons. Set to -1 to build up to cap.\\
&nbsp;&nbsp;&nbsp;&nbsp;Ziggurat:\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;This is for all the unicorn buildings at the top of the Religion page, on the "Ziggurats" panel. Treat like buildings.\\
&nbsp;&nbsp;&nbsp;&nbsp;Transcend:\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;This is for all cryptotheology upgrades. Treat this like buildings.\\
&nbsp;&nbsp;&nbsp;&nbsp;Special:\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;These are individual special cases for processes that the script can automate. All of these are off by default, and would need to\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;be individually enabled by goals.setGoal(special option name,1), or whatever value is necessary for them.\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Special options:\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;feedLevi:\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Auto-feed the leviathans, if they're around, you have at least one necrocorn, and their energy level is less than 30.\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Set to 1 for on, 0 for off.\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;autoUnicorn:\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The script comes with a handy-dandy unicorn efficiency calculator. If you set this option to 1, it'll automatically\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;purchase unicorn buildings in the order that provides the best bonuses. This is optimized for unicorn income only. If you\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;want a breakdown of all the buildings and details, run "getBestUniBuilding(true);".\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;autoHunt:\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;This sends hunters whenever your catpower is full. 0 is off, 1 is on.\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;autoApoReset:\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;This will automatically reset your SR bonus into praise% points when it passes the threshhold you set. 0 is off. For\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;instance, if you want it to reset all praise points into the Praise the Sun bonus every time your SR bonus gets to 950%,\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;then you would use "goals.setGoal("autoApoReset",950);".\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;autoPraise:\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Same as autoHunt, but for praising when faith is full.\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;autoShatter:\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;If this is set to 1, it will automatically shatter a time crystal (if this is an available option) when chronoheat is 0.\\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;If set to 5, it will shatter 5 at a time when chronoheat is 0. If set to 0, it won't shatter any.

For custom code injection:\\
&nbsp;&nbsp;&nbsp;&nbsp;The script comes with a function called "customHook()". This is run every tick the script is run, right after craftVals are auto-\\
&nbsp;&nbsp;&nbsp;&nbsp;calculated and right before anything is actually crafted. You may rewrite the "customHook" function with whatever code you would like.\\
&nbsp;&nbsp;&nbsp;&nbsp;This will require Javascript knowledge. Here's an example I use casually:

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;extraHook = function(){
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;goals.setGoal("oil",Math.floor(gamePage.resPool.get("oil").maxValue-7500));
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;goals.setGoal("uranium",Math.floor(gamePage.resPool.get("uranium").maxValue-250));
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;goals.setGoal("unobtainium",Math.floor(gamePage.resPool.get("unobtainium").maxValue-1000));
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;goals.setGoal("steamworks",goals.getGoal("magneto"))
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}

&nbsp;&nbsp;&nbsp;&nbsp;This one, when combined with eludium, thorium, and kerosene being set to -1, means they'll only be crafted when their requisite\\
&nbsp;&nbsp;&nbsp;&nbsp;materials hit max value. It also locks the steamworks goal to the magneto goal, meaning I only have to change magnetos to get both up.\\
&nbsp;&nbsp;&nbsp;&nbsp;It's handy for moving targets.