# Bio-s-AutoPlay
Autoplay script for Kitten Game, located over at http://bloodrizer.ru/games/kittens

Open up AutoPlay.js. Copy all the text.

On the Kitten Game tab, open your javascript console - in Chrome, it's ctrl+shift+j. Google around how to do it in other browsers.
Paste the code into the console and press enter. Congratulations!

To set a goal for an item:
enter "goals.setGoal("<item name>",quantity);" into the console. For instance, to set infinite huts to be built, it'd be the following:
    goals.setGoal("hut",-1);

Some things to note:

 - Goals are used to regulate what to make. In the case of buildings, resources, and space, setting a goal to -1 means to build it
    infinitely, so long as you can afford it.
 - The script cannot craft resources for the first time. Just go to the workshop tab and craft a single one of any resource to allow
    the script to craft it.
 - At the start of the game, the script will automatically click the "gather catnip" button until you have a field. The script will also
    start off the goal for a field at 1.
 - For science and workshop upgrades, setting the goal to 1 just means to build it when it's ready. Setting it to 0 means to ignore it.
 - Hunters will automatically be sent to hunt all upon reaching the catpower cap. However, mind the wiki - mints are more powerful
    than hunters at certain points. Keep in mind you may still desire catpower for trades.
 - Faith will automatically be praised upon reaching the faith cap. If you want to buy a religion upgrade, buy it before your faith is
    autopraised.
 - Currently, religious upgrades and unicorn sacrifices are *not* automated.
 - Celestial events are automatically observed. This renders SETI unnecessary, but you may still prefer to buy it.
 - Catnip is all automatically converted to wood upon being completely filled.
 - Wood, minerals, and iron automatically have 25% of them converted to their secondary states (beams, slabs, and plates, respectively)
    when they are capped.
 - Science techs and workshop upgrades are all set to be automatically built upon being afforded. You may wish to turn certain ones off.
    For example, thorium reactors is typically not desired unless you have a high thorium income.
 - If you are not sure of the name of a goal, type "goals.res." and start typing out what the goal name is. Autocomplete should find it
    for you. Some common typos in built-in resource names:
      - Compendiums are "compedium"
      - Concrete is "concrate"
 - The script renames overlapping resource names. For instance, there is a craft named "steel" and a science named "steel." The science,
    for the sake of the goal, is named "steel2" instead. Therefore, you would need "goals.setGoal("steel2",1)" to change the goal
    of the science, and "goals.setGoal("steel",-1)" to set the goal of the resource instead.
