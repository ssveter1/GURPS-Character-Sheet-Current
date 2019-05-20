// G.U.R.P.S. (Grand Unified Roll Parsing Software) ver 3.4.3  13MAY2019
function processInlinerolls(msg) {
    if (_.has(msg, 'inlinerolls')) {
        return _.chain(msg.inlinerolls)
            .reduce(function(m, v, k) {
                var ti = _.reduce(v.results.rolls, function(m2, v2) {
                    if (_.has(v2, 'table')) {
                        m2.push(_.reduce(v2.results, function(m3,
                            v3) {
                            m3.push(v3.tableItem.name);
                            return m3;
                        }, []).join(', '));
                    }
                    return m2;
                }, []).join(', ');
                m['$[[' + k + ']]'] = (ti.length && ti) || v.results
                    .total || 0;
                return m;
            }, {})
            .reduce(function(m, v, k) {
                return m.replace(k, v);
            }, msg.content)
            .value();
    } else {
        return msg.content;
    }
}
// Attributes (Non-repeating)
on("chat:message", function(msg) {
    if (msg.type === "api" && /^!attr/.test(msg.content)) {
        let cmd = processInlinerolls(msg).split(/\s+/);
        var who = getObj('player', msg.playerid).get('_displayname')
            .split(' ')[0];
        var character = getObj('character', cmd[1]);
        var attrname = cmd[2];
        var name = getAttrByName(character.id, 'character_name');
        var whisper = getAttrByName(character.id, 'whispermode');
        var level = Number(cmd[3]);
        // Variables from API
        var roll = Number(randomInteger(6) + randomInteger(6) + randomInteger(6));
        var margin = Math.abs(level - roll);
		var gmrolling = who + " GM rolling dice!";
        var success;
        var fail;
        // Start building template output

        // ========== BEGIN ROLL LOGIC ==========
        if (roll === 3 || roll === 4) {
            success = "Critical Success";
            fail = "";
        } else if (roll === 5 && level >= 15) {
            success = "Critical Success";
            fail = "";
        } else if (roll === 6 && level >= 16) {
            success = "Critical Success";
            fail = "";
        } else if (roll < 17 && roll <= level) {
            success = "Success by a margin of: " + margin;
            fail = "";
        }
        // A roll of 18 is always a critical failure.
        else if (roll === 18) {
            fail = "Critical Failure";
            success = "";
        }
        // A roll of 17 is a critical failure if your effective skill is 15 or less; otherwise, it is an ordinary failure.
        else if (roll === 17 && level <= 15) {
            fail = "Critical Failure";
            success = "";
        }
        // Any roll of 10 greater than your effective skill is a critical failure
        else if (roll > level && margin >= 10) {
            fail = "Critical Failure";
            success = "";
        } else if (roll === 17 && margin < 10) {
            fail = "Failure by a margin of: " + margin;
            success = "";
        } else if (roll > level) {
            fail = "Failure by a margin of: " + margin;
            success = "";
        }
		// ================== END ROLL LOGIC =================
        // Send Template to Chat	
        log(msg.content);

        if (whisper === "public") {
            sendChat(msg.who,
                `&{template:GURPSATTR} {{charactername=${name}}} {{roll_name=${attrname}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}`);
        } else if (whisper === "secret") {
            sendChat(msg.who, `/w gm &{template:GURPSATTRGM} {{charactername=${name}}} {{roll_name=${attrname}}}  {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}`);

            sendChat(msg.who, `/w ` + who +
                `&{template:GURPSATTR} {{charactername=${name}}} {{roll_name=${attrname}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}`);
        } else if (whisper === "gm") {
            sendChat(msg.who, `/w gm &{template:GURPSATTRGM} {{charactername=${name}}} {{roll_name=${attrname}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}`);

            sendChat(msg.who, `&{template:GURPSGMROLLING} {{gmrolling=${gmrolling}}}`);
        }
    }
});
// Advantages
const advBuilder = (rowid, cell) => `repeating_traits_${rowid}_${cell}`;
on("chat:message", function(msg) {

    if (msg.type === "api" && /^!adv/.test(msg.content)) {
        // Variables from sheet
        var who = getObj('player', msg.playerid).get('_displayname')
            .split(' ')[0];
        let cmd = processInlinerolls(msg).split(/\s+/);
        var character = getObj('character', cmd[1]); // get character id
        let rowid = cmd[2]; // Get Row Id
        var name = getAttrByName(character.id, 'character_name');
        var whisper = getAttrByName(character.id, 'whispermode');
        var level = Number(cmd[3]); // target
        var notesOnOff = Number(cmd[4]); // Notes on/off
        var note = getAttrByName(character.id, advBuilder(rowid, 'notes'));
		var gmrolling = who + " GM rolling dice!";
        // Variables from API
        var roll = Number(randomInteger(6) + randomInteger(6) + randomInteger(6));
        var margin = Math.abs(level - roll);
        var success;
        var fail;
        // Start building template output
        if (notesOnOff === 1) {
            notes = note;
        } else {
            notes = "";
        }

        // ========== BEGIN ROLL LOGIC ==========
        if (roll === 3 || roll === 4) {
            success = "Critical Success";
            fail = "";
        } else if (roll === 5 && level >= 15) {
            success = "Critical Success";
            fail = "";
        } else if (roll === 6 && level >= 16) {
            success = "Critical Success";
            fail = "";
        } else if (roll < 17 && roll <= level) {
            success = "Success by a margin of: " + margin;
            fail = "";
        }
        // A roll of 18 is always a critical failure.
        else if (roll === 18) {
            fail = "Critical Failure";
            success = "";
        }
        // A roll of 17 is a critical failure if your effective skill is 15 or less; otherwise, it is an ordinary failure.
        else if (roll === 17 && level <= 15) {
            fail = "Critical Failure";
            success = "";
        }
        // Any roll of 10 greater than your effective skill is a critical failure
        else if (roll > level && margin >= 10) {
            fail = "Critical Failure";
            success = "";
        } else if (roll === 17 && margin < 10) {
            fail = "Failure by a margin of: " + margin;
            success = "";
        } else if (roll > level) {
            fail = "Failure by a margin of: " + margin;
            success = "";
        }
		// ================== END ROLL LOGIC =================
        //Log Message Contents
        log(msg.content);
        // Send Template to Chat	
        if (whisper === "public") {
            // Send to Public
            sendChat(msg.who,
                `&{template:GURPSADV} {{charactername=${name}}} {{roll_name=@{${name}|${advBuilder(rowid,'name')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}}`);
        } else if (whisper === "secret") {
            // Send to GM
            sendChat(msg.who, `/w gm &{template:GURPSADVGM} {{charactername=${name}}} {{roll_name=@{${name}|${advBuilder(rowid,'name')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}}`);
            // Send to Player             
            sendChat(msg.who, `/w ` + who +
                `&{template:GURPSADV} {{charactername=${name}}} {{roll_name=@{${name}|${advBuilder(rowid,'name')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}}`);
        } else if (whisper === "gm") {
            // Send to GM
            sendChat(msg.who, `/w gm &{template:GURPSADVGM} {{charactername=${name}}} {{roll_name=@{${name}|${advBuilder(rowid,'name')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}}`);
            // Send to Public    
            sendChat(msg.who, `&{template:GURPSGMROLLING} {{gmrolling=${gmrolling}}}`);
        }
    }
});
// Disadvantages
const disadBuilder = (rowid, cell) => `repeating_disadvantages_${rowid}_${cell}`;
on("chat:message", function(msg) {

    if (msg.type === "api" && /^!disad/.test(msg.content)) {
        // Variables from sheet
        var who = getObj('player', msg.playerid).get('_displayname')
            .split(' ')[0];
        let cmd = processInlinerolls(msg).split(/\s+/);
        var character = getObj('character', cmd[1]); // get character id
        let rowid = cmd[2]; // Get Row Id
        var name = getAttrByName(character.id, 'character_name');
        var whisper = getAttrByName(character.id, 'whispermode');
        var level = Number(cmd[3]); // target
        var notesOnOff = Number(cmd[4]); // Notes on/off
        var sect = cmd[5];
        var note = getAttrByName(character.id, disadBuilder(rowid, 'notes'));
		var gmrolling = who + " GM rolling dice!";
        // Variables from API
        var roll = Number(randomInteger(6) + randomInteger(6) + randomInteger(6));
        var margin = Math.abs(level - roll);
        var success;
        var fail;
        // Start building template output
        if (notesOnOff === 1) {
            notes = note;
        } else {
            notes = "";
        }

        // ========== BEGIN ROLL LOGIC ==========
        if (roll === 3 || roll === 4) {
            success = "Critical Success";
            fail = "";
        } else if (roll === 5 && level >= 15) {
            success = "Critical Success";
            fail = "";
        } else if (roll === 6 && level >= 16) {
            success = "Critical Success";
            fail = "";
        } else if (roll < 17 && roll <= level) {
            success = "Success by a margin of: " + margin;
            fail = "";
        }
        // A roll of 18 is always a critical failure.
        else if (roll === 18) {
            fail = "Critical Failure";
            success = "";
        }
        // A roll of 17 is a critical failure if your effective skill is 15 or less; otherwise, it is an ordinary failure.
        else if (roll === 17 && level <= 15) {
            fail = "Critical Failure";
            success = "";
        }
        // Any roll of 10 greater than your effective skill is a critical failure
        else if (roll > level && margin >= 10) {
            fail = "Critical Failure";
            success = "";
        } else if (roll === 17 && margin < 10) {
            fail = "Failure by a margin of: " + margin;
            success = "";
        } else if (roll > level) {
            fail = "Failure by a margin of: " + margin;
            success = "";
        }
		// ================== END ROLL LOGIC =================
        // Send Template to Chat	
        log(msg.content);

        if (whisper === "public") {
            sendChat(msg.who,
                `&{template:GURPSDISAD} {{charactername=${name}}} {{roll_name=@{${name}|${disadBuilder(rowid,'name')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}}`);
        } else if (whisper === "secret") {
            sendChat(msg.who, `/w gm &{template:GURPSDISADGM} {{charactername=${name}}} {{roll_name=@{${name}|${disadBuilder(rowid,'name')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}}`);

            sendChat(msg.who, `/w ` + who +
                `&{template:GURPSDISAD} {{charactername=${name}}} {{roll_name=@{${name}|${disadBuilder(rowid,'name')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}}`);
        } else if (whisper === "gm") {
            sendChat(msg.who, `/w gm &{template:GURPSDISADGM} {{charactername=${name}}} {{roll_name=@{${name}|${disadBuilder(rowid,'name')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}}`);

            sendChat(msg.who, `&{template:GURPSGMROLLING} {{gmrolling=${gmrolling}}}`);
        }
    }
});
// Quirks
const quirkBuilder = (rowid, cell) => `repeating_quirks_${rowid}_${cell}`;
on("chat:message", function(msg) {

    if (msg.type === "api" && /^!quirk/.test(msg.content)) {
        // Variables from sheet
        var who = getObj('player', msg.playerid).get('_displayname')
            .split(' ')[0];
        let cmd = processInlinerolls(msg).split(/\s+/);
        var character = getObj('character', cmd[1]); // get character id
        let rowid = cmd[2]; // Get Row Id
        var name = getAttrByName(character.id, 'character_name');
        var whisper = getAttrByName(character.id, 'whispermode');
        var level = Number(cmd[3]); // target
        var notesOnOff = Number(cmd[4]); // Notes on/off
        var sect = cmd[5];
        var note = getAttrByName(character.id, quirkBuilder(rowid, 'notes'));
		var gmrolling = who + " GM rolling dice!";
        // Variables from API
        var roll = Number(randomInteger(6) + randomInteger(6) + randomInteger(6));
        var margin = Math.abs(level - roll);
        var success;
        var fail;
        // Start building template output
        if (notesOnOff === 1) {
            notes = note;
        } else {
            notes = "";
        }

        // ========== BEGIN ROLL LOGIC ==========
        if (roll === 3 || roll === 4) {
            success = "Critical Success";
            fail = "";
        } else if (roll === 5 && level >= 15) {
            success = "Critical Success";
            fail = "";
        } else if (roll === 6 && level >= 16) {
            success = "Critical Success";
            fail = "";
        } else if (roll < 17 && roll <= level) {
            success = "Success by a margin of: " + margin;
            fail = "";
        }
        // A roll of 18 is always a critical failure.
        else if (roll === 18) {
            fail = "Critical Failure";
            success = "";
        }
        // A roll of 17 is a critical failure if your effective skill is 15 or less; otherwise, it is an ordinary failure.
        else if (roll === 17 && level <= 15) {
            fail = "Critical Failure";
            success = "";
        }
        // Any roll of 10 greater than your effective skill is a critical failure
        else if (roll > level && margin >= 10) {
            fail = "Critical Failure";
            success = "";
        } else if (roll === 17 && margin < 10) {
            fail = "Failure by a margin of: " + margin;
            success = "";
        } else if (roll > level) {
            fail = "Failure by a margin of: " + margin;
            success = "";
        }
		// ================== END ROLL LOGIC =================
        // Send Template to Chat	
        log(msg.content);

        if (whisper === "public") {
            sendChat(msg.who,
                `&{template:GURPSDISAD} {{charactername=${name}}} {{roll_name=@{${name}|${quirkBuilder(rowid,'name')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}}`);
        } else if (whisper === "secret") {
            sendChat(msg.who, `/w gm &{template:GURPSDISADGM} {{charactername=${name}}} {{roll_name=@{${name}|${quirkBuilder(rowid,'name')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}}`);

            sendChat(msg.who, `/w ` + who +
                `&{template:GURPSDISAD} {{charactername=${name}}} {{roll_name=@{${name}|${quirkBuilder(rowid,'name')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}}`);
        } else if (whisper === "gm") {
            sendChat(msg.who, `/w gm &{template:GURPSDISADGM} {{charactername=${name}}} {{roll_name=@{${name}|${quirkBuilder(rowid,'name')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}}`);

            sendChat(msg.who, `&{template:GURPSGMROLLING} {{gmrolling=${gmrolling}}}`);
        }
    }
});
// Traits
const raceBuilder = (rowid, cell) => `repeating_racial_${rowid}_${cell}`;
on("chat:message", function(msg) {

    if (msg.type === "api" && /^!race/.test(msg.content)) {
        // Variables from sheet
        var who = getObj('player', msg.playerid).get('_displayname')
            .split(' ')[0];
        let cmd = processInlinerolls(msg).split(/\s+/);
        var character = getObj('character', cmd[1]); // get character id
        let rowid = cmd[2]; // Get Row Id
        var name = getAttrByName(character.id, 'character_name');
        var whisper = getAttrByName(character.id, 'whispermode');
        var level = Number(cmd[3]); // target
        var notesOnOff = Number(cmd[4]); // Notes on/off
        var sect = cmd[5];
        var note = getAttrByName(character.id, raceBuilder(rowid, 'notes'));
		var gmrolling = who + " GM rolling dice!";
        // Variables from API
        var roll = Number(randomInteger(6) + randomInteger(6) + randomInteger(6));
        var margin = Math.abs(level - roll);

        var success;
        var fail;
        // Start building template output
        if (notesOnOff === 1) {
            notes = note;
        } else {
            notes = "";
        }

        // ========== BEGIN ROLL LOGIC ==========
        if (roll === 3 || roll === 4) {
            success = "Critical Success";
            fail = "";
        } else if (roll === 5 && level >= 15) {
            success = "Critical Success";
            fail = "";
        } else if (roll === 6 && level >= 16) {
            success = "Critical Success";
            fail = "";
        } else if (roll < 17 && roll <= level) {
            success = "Success by a margin of: " + margin;
            fail = "";
        }
        // A roll of 18 is always a critical failure.
        else if (roll === 18) {
            fail = "Critical Failure";
            success = "";
        }
        // A roll of 17 is a critical failure if your effective skill is 15 or less; otherwise, it is an ordinary failure.
        else if (roll === 17 && level <= 15) {
            fail = "Critical Failure";
            success = "";
        }
        // Any roll of 10 greater than your effective skill is a critical failure
        else if (roll > level && margin >= 10) {
            fail = "Critical Failure";
            success = "";
        } else if (roll === 17 && margin < 10) {
            fail = "Failure by a margin of: " + margin;
            success = "";
        } else if (roll > level) {
            fail = "Failure by a margin of: " + margin;
            success = "";
        }
		// ================== END ROLL LOGIC =================

        // Send Template to Chat	
        log(msg.content);

        if (whisper === "public") {
            sendChat(msg.who,
                `&{template:GURPSTRAIT} {{charactername=${name}}} {{roll_name=@{${name}|${raceBuilder(rowid,'name')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}}`);
        } else if (whisper === "secret") {
            sendChat(msg.who, `/w gm &{template:GURPSTRAITGM} {{charactername=${name}}} {{roll_name=@{${name}|${raceBuilder(rowid,'name')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}}`);

            sendChat(msg.who, `/w ` + who +
                `&{template:GURPSTRAIT} {{charactername=${name}}} {{roll_name=@{${name}|${raceBuilder(rowid,'name')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}}`);
        } else if (whisper === "gm") {
            sendChat(msg.who, `/w gm &{template:GURPSTRAITGM} {{charactername=${name}}} {{roll_name=@{${name}|${raceBuilder(rowid,'name')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}}`);

            sendChat(msg.who, `&{template:GURPSGMROLLING} {{gmrolling=${gmrolling}}}`);
        }
    }
});

// Skills
const skillsBuilder = (rowid, skl) => `repeating_skills_${rowid}_${skl}`;
on("chat:message", function(msg) {

    if (msg.type === "api" && /^!skill/.test(msg.content)) {
        // Variables from sheet
        var who = getObj('player', msg.playerid).get('_displayname')
            .split(' ')[0];
        let cmd = processInlinerolls(msg).split(/\s+/);
        var character = getObj('character', cmd[1]); // get character id
        let rowid = cmd[2]; // Get Row Id
        var name = getAttrByName(character.id, 'character_name');
        var whisper = getAttrByName(character.id, 'whispermode');
        var level = Number(cmd[3]); // target
        var notesOnOff = Number(cmd[4]); // Notes on/off
        var repeat = String(cmd[5]); // Repeating Section Name
        var note = getAttrByName(character.id, skillsBuilder(rowid, 'notes'));
		var gmrolling = who + " GM rolling dice!";
        // Variables from API
        var roll = Number(randomInteger(6) + randomInteger(6) + randomInteger(6));
        var margin = Math.abs(level - roll);
        var success;
        var fail;
        // Start building template output
        if (notesOnOff === 1) {
            notes = note;
        } else {
            notes = "";
        }

        // ========== BEGIN ROLL LOGIC ==========
        if (roll === 3 || roll === 4) {
            success = "Critical Success";
            fail = "";
        } else if (roll === 5 && level >= 15) {
            success = "Critical Success";
            fail = "";
        } else if (roll === 6 && level >= 16) {
            success = "Critical Success";
            fail = "";
        } else if (roll < 17 && roll <= level) {
            success = "Success by a margin of: " + margin;
            fail = "";
        }
        // A roll of 18 is always a critical failure.
        else if (roll === 18) {
            fail = "Critical Failure";
            success = "";
        }
        // A roll of 17 is a critical failure if your effective skill is 15 or less; otherwise, it is an ordinary failure.
        else if (roll === 17 && level <= 15) {
            fail = "Critical Failure";
            success = "";
        }
        // Any roll of 10 greater than your effective skill is a critical failure
        else if (roll > level && margin >= 10) {
            fail = "Critical Failure";
            success = "";
        } else if (roll === 17 && margin < 10) {
            fail = "Failure by a margin of: " + margin;
            success = "";
        } else if (roll > level) {
            fail = "Failure by a margin of: " + margin;
            success = "";
        }
		// ================== END ROLL LOGIC =================

        // Send Template to Chat	
        log(msg.content);

        if (whisper === "public") {
            sendChat(msg.who,
                `&{template:GURPSSKILL} {{charactername=${name}}} {{roll_name=@{${name}|${skillsBuilder(rowid,'skillname')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}}`);
        } else if (whisper === "secret") {
            sendChat(msg.who, `/w gm &{template:GURPSSKILLGM} {{charactername=${name}}} {{roll_name=@{${name}|${skillsBuilder(rowid,'skillname')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success.toString()}}} {{fail=${fail.toString()}}} {{notes=${notes.toString()}}}`);

            sendChat(msg.who, `/w ` + who +
                `&{template:GURPSSKILL} {{charactername=${name}}} {{roll_name=@{${name}|${skillsBuilder(rowid,'skillname')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success.toString()}}} {{fail=${fail.toString()}}} {{notes=${notes.toString()}}}`);
        } else if (whisper === "gm") {
            sendChat(msg.who, `/w gm &{template:GURPSSKILLGM} {{charactername=${name}}} {{roll_name=@{${name}|${skillsBuilder(rowid,'skillname')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success.toString()}}} {{fail=${fail.toString()}}} {{notes=${notes.toString()}}}`);

            sendChat(msg.who, `&{template:GURPSGMROLLING} {{gmrolling=${gmrolling}}}`);
        }
    }
});

// Techniques
const techbuilder = (rowid, tch) => `repeating_techniques_${rowid}_${tch}`;
on("chat:message", function(msg) {

    if (msg.type === "api" && /^!tech/.test(msg.content)) {
        // Variables from sheet
        var who = getObj('player', msg.playerid).get('_displayname')
            .split(' ')[0];
        let cmd = processInlinerolls(msg).split(/\s+/);
        var character = getObj('character', cmd[1]); // get character id
        let rowid = cmd[2]; // Get Row Id
        var name = getAttrByName(character.id, 'character_name');
        var whisper = getAttrByName(character.id, 'whispermode');
        var level = Number(cmd[3]); // target
        var notesOnOff = Number(cmd[4]); // Notes on/off
        var note = getAttrByName(character.id, techbuilder(rowid, 'notes'));
        var parent = getAttrByName(character.id, techbuilder(rowid, 'parent_name'));
		var gmrolling = who + " GM rolling dice!";
        // Variables from API
        var roll = Number(randomInteger(6) + randomInteger(6) + randomInteger(6));
        var margin = Math.abs(level - roll);
        var success;
        var fail;
        // Start building template output
        if (notesOnOff === 1) {
            notes = note;
        } else {
            notes = "";
        }

        // ========== BEGIN ROLL LOGIC ==========
        if (roll === 3 || roll === 4) {
            success = "Critical Success";
            fail = "";
        } else if (roll === 5 && level >= 15) {
            success = "Critical Success";
            fail = "";
        } else if (roll === 6 && level >= 16) {
            success = "Critical Success";
            fail = "";
        } else if (roll < 17 && roll <= level) {
            success = "Success by a margin of: " + margin;
            fail = "";
        }
        // A roll of 18 is always a critical failure.
        else if (roll === 18) {
            fail = "Critical Failure";
            success = "";
        }
        // A roll of 17 is a critical failure if your effective skill is 15 or less; otherwise, it is an ordinary failure.
        else if (roll === 17 && level <= 15) {
            fail = "Critical Failure";
            success = "";
        }
        // Any roll of 10 greater than your effective skill is a critical failure
        else if (roll > level && margin >= 10) {
            fail = "Critical Failure";
            success = "";
        } else if (roll === 17 && margin < 10) {
            fail = "Failure by a margin of: " + margin;
            success = "";
        } else if (roll > level) {
            fail = "Failure by a margin of: " + margin;
            success = "";
        }
		// ================== END ROLL LOGIC =================

        // Send Template to Chat	
        log(msg.content);

        if (whisper === "public") {
            sendChat(msg.who,
                `&{template:GURPSTECH} {{charactername=${name}}} {{roll_name=@{${name}|${techbuilder(rowid,'skillname')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}} {{parent_name=${parent.toString()}}}`);
        } else if (whisper === "secret") {
            sendChat(msg.who, `/w gm &{template:GURPSTECHGM} {{charactername=${name}}} {{roll_name=@{${name}|${techbuilder(rowid,'skillname')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success.toString()}}} {{fail=${fail.toString()}}} {{notes=${notes.toString()}}} {{parent_name=${parent.toString()}}}`);

            sendChat(msg.who, `/w ` + who +
                `&{template:GURPSTECH} {{charactername=${name}}} {{roll_name=@{${name}|${techbuilder(rowid,'skillname')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success.toString()}}} {{fail=${fail.toString()}}} {{notes=${notes.toString()}}} {{parent_name=${parent.toString()}}}`);
        } else if (whisper === "gm") {
            sendChat(msg.who, `/w gm &{template:GURPSTECHGM} {{charactername=${name}}} {{roll_name=@{${name}|${techbuilder(rowid,'skillname')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success.toString()}}} {{fail=${fail.toString()}}} {{notes=${notes.toString()}}} {{parent_name=${parent.toString()}}}`);

            sendChat(msg.who, `&{template:GURPSGMROLLING} {{gmrolling=${gmrolling}}}`);
        }
    }
});
// Defense
const defBuilder = (rowid, cell) => `repeating_defense_${rowid}_${cell}`;
on("chat:message", function(msg) {

    if (msg.type === "api" && /^!def/.test(msg.content)) {
        // Variables from sheet
        var who = getObj('player', msg.playerid).get('_displayname')
            .split(' ')[0];
        let cmd = processInlinerolls(msg).split(/\s+/);
        var character = getObj('character', cmd[1]); // get character id
        let rowid = cmd[2]; // Get Row Id
        var name = getAttrByName(character.id, 'character_name');
        var whisper = getAttrByName(character.id, 'whispermode');
        var level = Number(cmd[3]); // target
        var notesOnOff = Number(cmd[4]); // Notes on/off
        var note = getAttrByName(character.id, defBuilder(rowid, 'notes'));
        var type = getAttrByName(character.id, defBuilder(rowid, 'ad_type'));
		var gmrolling = who + " GM rolling dice!";
        // Variables from API
        var roll = Number(randomInteger(6) + randomInteger(6) + randomInteger(6));
        var margin = Math.abs(level - roll);
        var success;
        var fail;
        // Start building template output
        if (notesOnOff === 1) {
            notes = note;
        } else {
            notes = "";
        }

        // ========== BEGIN ROLL LOGIC ==========
        if (roll === 3 || roll === 4) {
            success = "Critical Success";
            fail = "";
        } else if (roll === 5 && level >= 15) {
            success = "Critical Success";
            fail = "";
        } else if (roll === 6 && level >= 16) {
            success = "Critical Success";
            fail = "";
        } else if (roll < 17 && roll <= level) {
            success = "Success by a margin of: " + margin;
            fail = "";
        }
        // A roll of 18 is always a critical failure.
        else if (roll === 18) {
            fail = "Critical Failure";
            success = "";
        }
        // A roll of 17 is a critical failure if your effective skill is 15 or less; otherwise, it is an ordinary failure.
        else if (roll === 17 && level <= 15) {
            fail = "Critical Failure";
            success = "";
        }
        // Any roll of 10 greater than your effective skill is a critical failure
        else if (roll > level && margin >= 10) {
            fail = "Critical Failure";
            success = "";
        } else if (roll === 17 && margin < 10) {
            fail = "Failure by a margin of: " + margin;
            success = "";
        } else if (roll > level) {
            fail = "Failure by a margin of: " + margin;
            success = "";
        }
		// ================== END ROLL LOGIC =================

        // Send Template to Chat	
        log(msg.content);

        if (whisper === "public") {
            sendChat(msg.who,
                `&{template:GURPSDEFENSE} {{charactername=${name}}} {{roll_name=@{${name}|${defBuilder(rowid,'name')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}} {{type=${type.toString()}}}`);
        } else if (whisper === "secret") {
            sendChat(msg.who, `/w gm &{template:GURPSDEFENSEGM} {{charactername=${name}}} {{roll_name=@{${name}|${defBuilder(rowid,'name')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}} {{type=${type.toString()}}}`);

            sendChat(msg.who, `/w ` + who +
                `&{template:GURPSDEFENSE} {{charactername=${name}}} {{roll_name=@{${name}|${defBuilder(rowid,'name')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}} {{type=${type.toString()}}}`);
        } else if (whisper === "gm") {
            sendChat(msg.who, `/w gm &{template:GURPSDEFENSEGM} {{charactername=${name}}} {{roll_name=@{${name}|${defBuilder(rowid,'name')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}} {{type=${type.toString()}}}`);

            sendChat(msg.who, `&{template:GURPSGMROLLING} {{gmrolling=${gmrolling}}}`);
        }
    }
});

// Dodge (Non-repeating)
on("chat:message", function(msg) {
    if (msg.type === "api" && /^!dodge/.test(msg.content)) {
        let cmd = processInlinerolls(msg).split(/\s+/);
        var who = getObj('player', msg.playerid).get('_displayname')
            .split(' ')[0];
        var character = getObj('character', cmd[1]);
        var attrname = cmd[2];
        var name = getAttrByName(character.id, 'character_name');
        var whisper = getAttrByName(character.id, 'whispermode');
        var level = Number(cmd[3]);
		var gmrolling = who + " GM rolling dice!";
        // Variables from API
        var roll = Number(randomInteger(6) + randomInteger(6) + randomInteger(6));
        var margin = Math.abs(level - roll);
        var success;
        var fail;
        // Start building template output

        // ========== BEGIN ROLL LOGIC ==========
        if (roll === 3 || roll === 4) {
            success = "Critical Success";
            fail = "";
        } else if (roll === 5 && level >= 15) {
            success = "Critical Success";
            fail = "";
        } else if (roll === 6 && level >= 16) {
            success = "Critical Success";
            fail = "";
        } else if (roll < 17 && roll <= level) {
            success = "Success by a margin of: " + margin;
            fail = "";
        }
        // A roll of 18 is always a critical failure.
        else if (roll === 18) {
            fail = "Critical Failure";
            success = "";
        }
        // A roll of 17 is a critical failure if your effective skill is 15 or less; otherwise, it is an ordinary failure.
        else if (roll === 17 && level <= 15) {
            fail = "Critical Failure";
            success = "";
        }
        // Any roll of 10 greater than your effective skill is a critical failure
        else if (roll > level && margin >= 10) {
            fail = "Critical Failure";
            success = "";
        } else if (roll === 17 && margin < 10) {
            fail = "Failure by a margin of: " + margin;
            success = "";
        } else if (roll > level) {
            fail = "Failure by a margin of: " + margin;
            success = "";
        }
		// ================== END ROLL LOGIC =================

        // Send Template to Chat	
        log(msg.content);

        if (whisper === "public") {
            sendChat(msg.who,
                `&{template:GURPSDEFENSE} {{charactername=${name}}} {{roll_name=${attrname}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}} {{type=Dodge}}`);
        } else if (whisper === "secret") {
            sendChat(msg.who, `/w gm &{template:GURPSDEFENSEGM} {{charactername=${name}}} {{roll_name=${attrname}}}  {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}} {{type=Dodge}}`);

            sendChat(msg.who, `/w ` + who +
                `&{template:GURPSDEFENSE} {{charactername=${name}}} {{roll_name=${attrname}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}} {{type=Dodge}}`);
        } else if (whisper === "gm") {
            sendChat(msg.who, `/w gm &{template:GURPSDEFENSEGM} {{charactername=${name}}} {{roll_name=${attrname}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}} {{type=Dodge}}`);

            sendChat(msg.who, `&{template:GURPSGMROLLING} {{gmrolling=${gmrolling}}}`);
        }
    }
});

// Melee
const meleeBuilder = (rowid, atk) => `repeating_melee_${rowid}_${atk}`;
on("chat:message", function(msg) {

    if (msg.type === "api" && /^!melee/.test(msg.content)) {
        // Variables from sheet
        var who = getObj('player', msg.playerid).get('_displayname')
            .split(' ')[0];
        let cmd = processInlinerolls(msg).split(/\s+/);
        var character = getObj('character', cmd[1]); // get character id
        let rowid = cmd[2]; // Get Row Id
        var name = getAttrByName(character.id, 'character_name');
        var whisper = getAttrByName(character.id, 'whispermode');
        var level = Number(cmd[3]); // target
        var dam = String(cmd[4]); // damage
        var dtype = String(cmd[5]); // damage type
        var table = Number(cmd[6]); // Hit Location Table Roll
        var subtable = Number(cmd[7]); // Subtable Roll
        var notesOnOff = Number(cmd[8]); // Notes on/off
        var note = getAttrByName(character.id, meleeBuilder(rowid, 'notes'));
        var unarmed = getAttrByName(character.id, meleeBuilder(rowid, 'unarmed_attack'));
        var usage = getAttrByName(character.id, meleeBuilder(rowid, 'usage'));
		var gmrolling = who + " GM rolling dice!";
        // Variables from API
        var roll = Number(randomInteger(6) + randomInteger(6) +
            randomInteger(6));
        var margin = Math.abs(level - roll);
        var critroll = Number(randomInteger(6) + randomInteger(6) +
            randomInteger(6));
        var success;
        var fail;
        var loc;
        var wm;
        var wn;
        var crittable;
        var head;
        var body;
        var crit;
        // Start building template output
        if (notesOnOff === 1) {
            notes = note;
        } else {
            notes = "";
        }

        if (table === 0) {
            table = Number(randomInteger(6) + randomInteger(6) +
                randomInteger(6));
        }
        if (subtable === 0) {
            subtable = Number(randomInteger(6));
        }
        switch (table) {
            case 3: // Skull
            case 4:
                switch (dtype) {
                    case "tox":
                        loc = "Skull";
                        wm = "x1";
                        wn = "";
                        crittable = "Head";
                        break;
                    default:
                        loc = "Skull";
                        wm = "x4";
                        wn = "any injury causing shock requires stun/knockdown roll, major wound roll -10 vs stun/knockdown; bleed at 30 seconds not 1 minute";
                        crittable = "Head";
                }
                break;
            case 5: // Face Subtable locations pg 3. LOADOUTS: LOW-TECH ARMOR
                switch (subtable) {
                    case 1:
                        switch (dtype) {
                            case "cor":
                                loc = "Jaw";
                                wm = "x1 1/2";
                                wn =
                                    "Any injury causing shock requires -1 stun/knockdown roll; major wound roll -6 to stun/knockdown";
                                crittable = "Head";
                                break;
                            default:
                                loc = "Jaw";
                                wm = "x4";
                                wn =
                                    "Any injury causing shock requires -1 stun/knockdown roll; major wound roll -6 to stun/knockdown";
                                crittable = "Head";
                        }
                        break;
                    case 2:
                        switch (dtype) {
                            case "cor":
                                loc = "Nose";
                                wm = "x1 1/2";
                                wn =
                                    "Cripple over 1/4 HP and causes No Sense of Smell/Taste (non-cutting) or Appearance loss (cutting, x2 crippling threshold), non-cutting major wound -5 to stun/knockdown.";
                                crittable = "Head";
                                break;
                            default:
                                loc = "Nose";
                                wm = "x4";
                                wn =
                                    "Cripple over 1/4 HP and causes No Sense of Smell/Taste (non-cutting) or Appearance loss (cutting, x2 crippling threshold), non-cutting major wound -5 to stun/knockdown.";
                                crittable = "Head";
                        }
                        break;
                    case 3:
                        switch (dtype) {
                            case "cor":
                                loc = "Ear";
                                wm = "x1 1/2";
                                wn =
                                    "Cripple over 1/4 HP, no -5 to stun/knockdown, major wound only on sever; lost ear causes Appearance penalties.";
                                crittable = "Head";
                                break;
                            default:
                                loc = "Ear";
                                wm = "x4";
                                wn =
                                    "Cripple over 1/4 HP, no -5 to stun/knockdown, major wound only on sever; lost ear causes Appearance penalties.";
                                crittable = "Head";
                        }
                        break;
                    case 4:
                    case 5:
                        switch (dtype) {
                            case "cor":
                                loc = "Cheeks";
                                wm = "x1 1/2";
                                wn =
                                    "Any injury causing shock requires stun/knockdown roll, major wound roll -10 vs stun/knockdown; bleed at 30 seconds not 1 minute";
                                crittable = "Head";
                                break;
                            default:
                                loc = "Cheeks";
                                wm = "x4";
                                wn =
                                    "Any injury causing shock requires stun/knockdown roll, major wound roll -10 vs stun/knockdown; bleed at 30 seconds not 1 minute";
                                crittable = "Head";
                        }
                        break;
                    case 6:
                        switch (dtype) {
                            case "cor":
                                loc = "Eye";
                                wm = "x1 1/2";
                                wn =
                                    "Cripple over 1/10 hp; otherwise skull hit w/no DR. Tox has no spec. effect beyond cripple; bleed at 30 seconds not 1 min.";
                                crittable = "Head";
                                break;
                            case "tox":
                                loc = "Eye";
                                wm = "x1";
                                wn =
                                    "Cripple over 1/10 hp; otherwise skull hit w/no DR. Tox has no spec. effect beyond cripple; bleed at 30 seconds not 1 min.";
                                crittable = "Head";
                                break;
                            default:
                                loc = "Eye";
                                wm = "x4";
                                wn =
                                    "Cripple over 1/10 hp; otherwise skull hit w/no DR. Tox has no spec. effect beyond cripple; bleed at 30 seconds not 1 min.";
                                crittable = "Head";
                        }
                        break;
                }
                break;
            case 6: // Leg (Right)
            case 7:
                switch (subtable) {
                    case 1:
                    case 2:
                    case 3:
                        switch (dtype) {
                            case "pi-":
                                loc = "Shin (Right)";
                                wm = "x1/2";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                                break;
                            case "cut":
                                loc = "Shin (Right)";
                                wm = "x1 1/2";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                                break;
                            default:
                                loc = "Shin (Right)";
                                wm = "x1";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                        }
                        break;
                    case 4:
                        switch (dtype) {
                            case "cr":
                                loc = "Knee (Right)";
                                wm = "x1";
                                wn =
                                    "As per limb but cripple over 1/3 HP; dismember as per limb, not per joint; recover from cripple at -2";
                                crittable = "Body";
                                break;
                            case "pi-":
                                loc = "Leg (Right)";
                                wm = "x1/2";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                                break;
                            case "cut":
                                loc = "Leg (Right)";
                                wm = "x1 1/2";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                                break;
                            default:
                                loc = "Leg (Right)";
                                wm = "x1";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                        }
                        break;
                    case 5:
                        switch (dtype) {
                            case "pi-":
                                loc = "Thigh (Right)";
                                wm = "x1/2";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                                break;
                            case "cut":
                                loc = "Thigh (Right)";
                                wm = "x1 1/2";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                                break;
                            default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                loc = "Thigh (Right)";
                                wm = "x1";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                        }
                        break;
                    case 6:
                        // Limb Vein/Artery cut & pi+ x2 , imp & pi++ x2.5, pi- x1, pi & bu (tb) x1.5 only
                        switch (dtype) {
                            case "pi-":
                            case "butb":
                                loc = "Thigh Right (Vein/artery)";
                                wm = "x1";
                                wn =
                                    "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                crittable = "Body";
                                break;
                            case "pi":
                                loc = "Thigh Right (Vein/artery)";
                                wm = "x1 1/2";
                                wn =
                                    "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                crittable = "Body";
                                break;
                            case "imp":
                            case "pi++":
                                loc = "Thigh Right(Vein/artery)";
                                wm = "x2 1/2";
                                wn =
                                    "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                crittable = "Body";
                                break;
                            case "cut":
                            case "pi+":
                                loc = "Thigh Right (Vein/artery))";
                                wm = "x2";
                                wn =
                                    "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                crittable = "Body";
                                break;
                            case "cor":
                            case "cr":
                                loc = "Thigh (Right)";
                                wm = "x2";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                                break;
                            default:
                                loc = "Thigh (Right)";
                                wm = "x1";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                        }
                        break;
                }
                break;
            case 8: // Arm (Right)
                switch (subtable) {
                    case 1:
                    case 2:
                    case 3:
                        switch (dtype) {
                            case "pi-":
                                loc = "Forearm (Right)";
                                wm = "x1/2";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                                break;
                            case "cut":
                                loc = "Forearm (Right)";
                                wm = "x1 1/2";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                                break;
                            default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                loc = "Forearm (Right)";
                                wm = "x1";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                        }
                        break;
                    case 4:
                        switch (dtype) {
                            case "pi-":
                                loc = "Elbow (Right)";
                                wm = "x1/2";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                                break;
                            case "cut":
                                loc = "Elbow (Right)";
                                wm = "x1 1/2";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                                break;
                            case "cr":
                                loc = "Elbow (Right)";
                                wm = "x1 1/2";
                                wn =
                                    "Miss by 1 hit limb; as per limb but cripple over 1/3 HP; dismember as per limb, not per joint; recover from cripple at -2";
                                crittable = "Body";
                                break;
                            default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                loc = "Elbow (Right)";
                                wm = "x1";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                        }
                        break;
                    case 5:
                        switch (dtype) {
                            case "pi-":
                                loc = "Upper Arm (Right)";
                                wm = "x1/2";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                                break;
                            case "cut":
                                loc = "Upper Arm (Right)";
                                wm = "x1 1/2";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                                break;
                            default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                loc = "Upper Arm (Right)";
                                wm = "x1";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                        }
                        break;
                    case 6:
                        // Limb Vein/Artery cut & pi+ x2 , imp & pi++ x2.5, pi- x1, pi & bu (tb) x1.5 only
                        switch (dtype) {
                            case "pi-":
                            case "butb":
                                loc = "Shoulder Right (Vein/Artery)";
                                wm = "x1";
                                wn =
                                    "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                crittable = "Body";
                                break;
                            case "pi":
                            case "bu(tb)":
                                loc = "Shoulder Right (Vein/Artery)";
                                wm = "x1 1/2";
                                wn =
                                    "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                crittable = "Body";
                                break;
                            case "imp":
                            case "pi++":
                                loc = "Shoulder Right (Vein/Artery)";
                                wm = "x2 1/2";
                                wn =
                                    "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                crittable = "Body";
                                break;
                            case "cut":
                            case "pi+":
                                loc = "Shoulder Right (Vein/Artery)";
                                wm = "x2";
                                wn =
                                    "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                crittable = "Body";
                                break;
                            default:
                                loc = "Shoulder Right";
                                wm = "x1";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                        }
                        break;
                }
                break;
            case 9: // Chest
            case 10:
                switch (subtable) {
                    case 1: // Vitals cr, imp, pi, or tight-beam burning only
                        switch (dtype) {
                            case "pi-":
                            case "pi":
                            case "pi+":
                            case "pi++":
                            case "imp":
                                loc = "Vitals";
                                wm = "x3";
                                wn =
                                    "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty.";
                                crittable = "Body";
                                break;
                            case "butb":
                                loc = "Vitals";
                                wm = "x2";
                                wn =
                                    "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty.";
                                crittable = "Body";
                                break;
                            case "cr":
                                loc = "Vitals";
                                wm = "x1";
                                wn =
                                    "HT roll for Knockdown, if major wound -5 stun/knockdown roll;<br /> injury can't exceed 2xHP (1xHP if using bleeding);<br />any excess is lost -4 bleed penalty.<br />If from behind treat as Spine.";
                                crittable = "Body";
                                break;
                            case "cut":
                                loc = "Chest";
                                wm = "x1 1/2";
                                wn =
                                    "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                crittable = "Body";
                                break;
                            default:
                                loc = "Chest";
                                wm = "x1";
                                wn =
                                    "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                crittable = "Body";
                        }
                        break;
                    case 7:
                        switch (dtype) {
                            case "pi-":
                                loc = "Spine";
                                wm = "x1/2";
                                wn = "Miss by 1 hit chest; 3 DR; as per chest (injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost) but enough injury for shock penalty (even with HPT) gives stun/knockdown, -5 if a major wound. Cripple over 1xHP Bad Back (Severe) and Lame (Paraplegic) until healed";
                                crittable = "Body";
                                break;
                            case "cut":
                            case "pi+":
                                loc = "Spine";
                                wm = "x1 1/2";
                                wn = "Miss by 1 hit chest; 3 DR; as per chest (injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost) but enough injury for shock penalty (even with HPT) gives stun/knockdown, -5 if a major wound. Cripple over 1xHP Bad Back (Severe) and Lame (Paraplegic) until healed";
                                crittable = "Body";
                                break;
                            case "imp":
                            case "pi++":
                                loc = "Spine";
                                wm = "x2";
                                wn = "Miss by 1 hit chest; 3 DR; as per chest (injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost) but enough injury for shock penalty (even with HPT) gives stun/knockdown, -5 if a major wound. Cripple over 1xHP Bad Back (Severe) and Lame (Paraplegic) until healed";
                                crittable = "Body";
                                break;
                            case "pi":
                            case "butb":
                                loc = "Spine";
                                wm = "x2";
                                wn = "Miss by 1 hit chest; 3 DR; as per chest (injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost) but enough injury for shock penalty (even with HPT) gives stun/knockdown, -5 if a major wound. Cripple over 1xHP Bad Back (Severe) and Lame (Paraplegic) until healed";
                                crittable = "Body";
                                break;
                            default:
                                loc = "Spine";
                                wm = "x1";
                                wn = "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                crittable = "Body";
                        }
                        break;
                    case 8:
                        switch (dtype) {
                            case "pi-":
                            case "pi":
                            case "pi+":
                            case "pi++":
                            case "imp":
                                loc = "Heart";
                                wm = "x3";
                                wn =
                                    "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty. May be special for some characters (e.g. Vampires).";
                                crittable = "Body";
                                break;
                            case "butb":
                                loc = "Heart";
                                wm = "x2";
                                wn =
                                    "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty. May be special for some characters (e.g. Vampires).";
                                crittable = "Body";
                                break;
                            case "cr":
                                loc = "Heart";
                                wm = "x1";
                                wn =
                                    "HT roll for Knockdown, if major wound -5 stun/knockdown roll;<br /> injury can't exceed 2xHP (1xHP if using bleeding);<br />any excess is lost -4 bleed penalty.<br />If from behind treat as Spine. May be special for some characters (e.g. Vampires). ";
                                crittable = "Body";
                                break;
                            case "cut":
                                loc = "Chest";
                                wm = "x1 1/2";
                                wn =
                                    "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost.";
                                crittable = "Body";
                                break;
                            default:
                                loc = "Chest";
                                wm = "x1";
                                wn =
                                    "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost.";
                                crittable = "Body";
                        }
                        break;
                    default:
                        switch (dtype) {
                            case "pi-":
                                loc = "Chest";
                                wm = "x1/2";
                                wn =
                                    "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                crittable = "Body";
                                break;
                            case "cut":
                                loc = "Chest";
                                wm = "x1 1/2";
                                wn =
                                    "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                crittable = "Body";
                                break;
                            case "imp":
                            case "pi++":
                                loc = "Chest";
                                wm = "x2";
                                wn =
                                    "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                crittable = "Body";
                                break;
                            default:
                                loc = "Chest";
                                wm = "x1";
                                wn =
                                    "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                crittable = "Body";
                        }
                }
                break;
            case 11: // Abdomen Subtable locations pg 4. LOADOUTS: LOW-TECH ARMOR
                switch (subtable) {
                    case 1:
                        switch (dtype) {
                            case "cr":
                            case "cor":
                            case "burn":
                            case "fat":
                            case "tox":
                            case "spcl":
                                loc = "Vitals";
                                wm = "x1";
                                wn =
                                    "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty.";
                                crittable = "Body";
                                break;
                            case "cut":
                                loc = "Vitals";
                                wm = "x1 1/2";
                                wn =
                                    "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty. If from behind treart as Spine.";
                                crittable = "Body";
                                break;
                            default:
                                loc = "Vitals";
                                wm = "x3";
                                wn =
                                    "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty";
                                crittable = "Body";
                        }
                        break;
                    case 2:
                    case 3:
                    case 4:
                        switch (dtype) {
                            case "pi-":
                                loc = "Digestive Tract";
                                wm = "x1/2";
                                wn =
                                    "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound HT-3 to avoid special";
                                crittable = "Body";
                                break;
                            case "cut":
                            case "pi+":
                                loc = "Digestive Tract";
                                wm = "x1 1/2";
                                wn =
                                    "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound HT-3 to avoid special";
                                crittable = "Body";
                                break;
                            case "imp":
                            case "pi++":
                                loc = "Digestive Tract";
                                wm = "x2";
                                wn =
                                    "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound HT-3 to avoid special";
                                crittable = "Body";
                                break;
                            default:
                                loc = "Digestive Tract";
                                wm = "x1";
                                wn =
                                    "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound HT-3 to avoid special";
                                crittable = "Body";
                        }
                        break;
                    case 5:
                        switch (dtype) {
                            case "pi-":
                                loc = "Pelvis";
                                wm = "x1/2";
                                wn =
                                    "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound: fall down, cannot stand, Lame (Missing Legs) until healed";
                                crittable = "Body";
                                break;
                            case "cut":
                            case "pi+":
                                loc = "Pelvis";
                                wm = "x1 1/2";
                                wn =
                                    "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound: fall down, cannot stand, Lame (Missing Legs) until healed";
                                crittable = "Body";
                                break;
                            case "imp":
                            case "pi++":
                                loc = "Pelvis";
                                wm = "x2";
                                wn =
                                    "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound: fall down, cannot stand, Lame (Missing Legs) until healed";
                                crittable = "Body";
                                break;
                            default:
                                loc = "Pelvis";
                                wm = "x1";
                                wn =
                                    "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound: fall down, cannot stand, Lame (Missing Legs) until healed";
                                crittable = "Body";
                        }
                        break;
                    case 6:
                        switch (dtype) {
                            case "pi-":
                                loc = "Groin";
                                wm = "x1/2";
                                wn = "double shock; major wound -5 stun/knockdown";
                                crittable = "Body";
                                break;
                            case "cut":
                            case "pi+":
                                loc = "Groin";
                                wm = "x1 1/2";
                                wn = "double shock; major wound -5 stun/knockdown";
                                crittable = "Body";
                                break;
                            case "imp":
                            case "pi++":
                                loc = "Groin";
                                wm = "x2";
                                wn = "double shock; major wound -5 stun/knockdown";
                                crittable = "Body";
                                break;
                            default:
                                loc = "Groin";
                                wm = "x1";
                                wn = "double shock; major wound -5 stun/knockdown";
                                crittable = "Body";
                        }
                        break;
                }
                break;
            case 12: // Left Arm
                switch (subtable) {
                    case 1:
                    case 2:
                    case 3:
                        switch (dtype) {
                            case "pi-":
                                loc = "Forearm (Left)";
                                wm = "x1/2";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                                break;
                            case "cut":
                                loc = "Forearm (Left)";
                                wm = "x1 1/2";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                                break;
                            default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                loc = "Forearm (Left)";
                                wm = "x1";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                        }
                        break;
                    case 4:
                        switch (dtype) {
                            case "pi-":
                                loc = "Elbow (Left)";
                                wm = "x1/2";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                                break;
                            case "cut":
                                loc = "Elbow (Left)";
                                wm = "x1 1/2";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                                break;
                            case "cr":
                                loc = "Elbow (Left)";
                                wm = "x1 1/2";
                                wn =
                                    "Miss by 1 hit limb; as per limb but cripple over 1/3 HP; dismember as per limb, not per joint; recover from cripple at -2";
                                crittable = "Body";
                                break;
                            default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                loc = "Elbow (Left)";
                                wm = "x1";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                        }
                        break;
                    case 5:
                        switch (dtype) {
                            case "pi-":
                                loc = "Upper Arm (Left)";
                                wm = "x1/2";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                                break;
                            case "cut":
                                loc = "Upper Arm (Left)";
                                wm = "x1 1/2";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                                break;
                            default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                loc = "Upper Arm (Left)";
                                wm = "x1";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                        }
                        break;
                    case 6:
                        // Limb Vein/Artery cut & pi+ x2 , imp & pi++ x2.5, pi- x1, pi & bu (tb) x1.5 only
                        switch (dtype) {
                            case "pi-":
                                loc = "Shoulder Left (Vein/Artery)";
                                wm = "x1";
                                wn =
                                    "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                crittable = "Body";
                                break;
                            case "pi":
                            case "butb":
                                loc = "Shoulder Left (Vein/Artery)";
                                wm = "x1 1/2";
                                wn =
                                    "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                crittable = "Body";
                                break;
                            case "imp":
                            case "pi++":
                                loc = "Shoulder Left (Vein/Artery)";
                                wm = "x2 1/2";
                                wn =
                                    "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                crittable = "Body";
                                break;
                            case "cut":
                            case "pi+":
                                loc = "Shoulder Left (Vein/Artery)";
                                wm = "x2";
                                wn =
                                    "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                crittable = "Body";
                                break;
                            default:
                                loc = "Shoulder Left";
                                wm = "x1";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                        }
                        break;
                }
                break;
            case 13: // Leg (Left)
            case 14:
                switch (subtable) {
                    case 1:
                    case 2:
                    case 3:
                        switch (dtype) {
                            case "pi-":
                                loc = "Shin (Left)";
                                wm = "x1/2";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                                break;
                            case "cut":
                                loc = "Shin (Left)";
                                wm = "x1 1/2";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                                break;
                            default:
                                loc = "Shin (Left)";
                                wm = "x1";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                        }
                        break;
                    case 4:
                        switch (dtype) {
                            case "cr":
                                loc = "Knee (Left)";
                                wm = "x1";
                                wn =
                                    "As per limb but cripple over 1/3 HP; dismember as per limb, not per joint; recover from cripple at -2";
                                crittable = "Body";
                                break;
                            case "pi-":
                                loc = "Leg (Left)";
                                wm = "x1/2";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                                break;
                            case "cut":
                                loc = "Leg (Left)";
                                wm = "x1 1/2";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                                break;
                            default:
                                loc = "Leg (Left)";
                                wm = "x1";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                        }
                        break;
                    case 5:
                        switch (dtype) {
                            case "pi-":
                                loc = "Thigh (Left)";
                                wm = "x1/2";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                                break;
                            case "cut":
                                loc = "Thigh (Left)";
                                wm = "x1 1/2";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                                break;
                            default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                loc = "Thigh (Left)";
                                wm = "x1";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                        }
                        break;
                    case 6:
                        // Limb Vein/Artery cut & pi+ x2 , imp & pi++ x2.5, pi- x1, pi & bu (tb) x1.5 only
                        switch (dtype) {
                            case "pi-":
                                loc = "Thigh Left (Vein/artery)";
                                wm = "x1";
                                wn =
                                    "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                crittable = "Body";
                                break;
                            case "pi":
                                loc = "Thigh Left (Vein/artery)";
                                wm = "x1 1/2";
                                wn =
                                    "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                crittable = "Body";
                                break;
                            case "imp":
                            case "pi++":
                                loc = "Thigh Left(Vein/artery)";
                                wm = "x2 1/2";
                                wn =
                                    "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                crittable = "Body";
                                break;
                            case "cut":
                            case "pi+":
                                loc = "Thigh Left (Vein/artery)";
                                wm = "x2";
                                wn =
                                    "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                crittable = "Body";
                                break;
                            case "cor":
                            case "cr":
                                loc = "Thigh Left";
                                wm = "x2";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                                break;
                            default:
                                loc = "Thigh Left";
                                wm = "x1";
                                wn = "cripple over 1/2 HP";
                                crittable = "Body";
                        }
                        break;
                }
                break;
            case 15: // Hand Extremity
                switch (subtable) {
                    case 1:
                        switch (dtype) {
                            case "pi-":
                                loc = "Hand Joint";
                                wm = "x1/2";
                                wn =
                                    "Miss by 1 hit extremity; as per extremity but cripple over 1/4 HP; dismember as per extremity, not per joint; recover from cripple at -2";
                                crittable = "Body";
                                break;
                            case "cut":
                                loc = "Hand Joint";
                                wm = "x1 1/2";
                                wn =
                                    "Miss by 1 hit extremity; as per extremity but cripple over 1/4 HP; dismember as per extremity, not per joint; recover from cripple at -2";
                                crittable = "Body";
                                break;
                            default:
                                loc = "Hand Extremity";
                                wm = "x1";
                                wn = "cripple over 1/3 HP";
                                crittable = "Body";
                        }
                        break;
                    default:
                        switch (dtype) {
                            case "pi-":
                                loc = "Hand Extremity";
                                wm = "x1/2";
                                wn = "cripple over 1/3 HP";
                                crittable = "Body";
                                break;
                            case "cut":
                                loc = "Hand Extremity";
                                wm = "x1 1/2";
                                wn = "cripple over 1/3 HP";
                                crittable = "Body";
                                break;
                            default:
                                loc = "Hand Extremity";
                                wm = "x1";
                                wn = "cripple over 1/3 HP";
                                crittable = "Body";
                        }
                }
                break;
            case 16: // Foot Extremity
                switch (subtable) {
                    case 1:
                        switch (dtype) {
                            case "pi-":
                                loc = "Foot Joint";
                                wm = "x1/2";
                                wn =
                                    "Miss by 1 hit extremity; as per extremity but cripple over 1/4 HP; dismember as per extremity, not per joint; recover from cripple at -2";
                                crittable = "Body";
                                break;
                            case "cut":
                                loc = "Foot Joint";
                                wm = "x1 1/2";
                                wn =
                                    "Miss by 1 hit extremity; as per extremity but cripple over 1/4 HP; dismember as per extremity, not per joint; recover from cripple at -2";
                                crittable = "Body";
                                break;
                            default:
                                loc = "Foot Extremity";
                                wm = "x1";
                                wn = "cripple over 1/3 HP";
                                crittable = "Body";
                        }
                        break;
                    default:
                        switch (dtype) {
                            case "pi-":
                                loc = "Foot Extremity";
                                wm = "x1/2";
                                wn = "cripple over 1/3 HP";
                                crittable = "Body";
                                break;
                            case "cut":
                                loc = "Foot Extremity";
                                wm = "x1 1/2";
                                wn = "cripple over 1/3 HP";
                                crittable = "Body";
                                break;
                            default:
                                loc = "Foot Extremity";
                                wm = "x1";
                                wn = "cripple over 1/3 HP";
                                crittable = "Body";
                        }
                }
                break;
            case 17: // Neck
            case 18:
                switch (subtable) {
                    case 1:
                        switch (dtype) {
                            case "pi-":
                                loc = "Neck Vein/Artery";
                                wm = "x1/2";
                                wn =
                                    "Bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                crittable = "Body";
                                break;
                            case "cr":
                                loc = "Neck Windpipe";
                                wm = "x2";
                                wn =
                                    "Injury over HP/2 to the neck hit location as a crippling injury which crushes the windpipe, causing choking.";
                                crittable = "Body";
                                break;
                            case "cor":
                            case "imp":
                            case "pi++":
                                loc = "Neck Vein/Artery";
                                wm = "x2";
                                wn =
                                    "Bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                crittable = "Body";
                                break;
                            case "cut":
                                loc = "Neck Vein/Artery";
                                wm = "x2 1/2";
                                wn =
                                    "Bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                crittable = "Body";
                                break;
                            case "pi+":
                            case "butb":
                                loc = "Neck Vein/Artery";
                                wm = "x1 1/2";
                                wn =
                                    "Bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                crittable = "Body";
                                break;
                            default:
                                loc = "Neck Vein/Artery";
                                wm = "x1";
                                wn =
                                    "Bleed at 30 seconds not 1 minute; -2 bleed penalty.";
                                crittable = "Body";
                        }
                        break;
                    default:
                        switch (dtype) {
                            case "pi-":
                                loc = "Neck";
                                wm = "x1/2";
                                wn =
                                    "Bleed at 30 seconds not 1 minute; -2 bleed penalty.";
                                crittable = "Body";
                                break;
                            case "cut":
                            case "imp":
                            case "pi++":
                                loc = "Neck";
                                wm = "x2";
                                wn =
                                    "Bleed at 30 seconds not 1 minute; -2 bleed penalty.";
                                crittable = "Body";
                                break;
                            case "cor":
                            case "pi":
                                loc = "Neck";
                                wm = "x1 1/2";
                                wn =
                                    "Bleed at 30 seconds not 1 minute; -2 bleed penalty.";
                                crittable = "Body";
                                break;
                            case "cr":
                                loc = "Neck";
                                wm = "x1 1/2";
                                wn =
                                    "Injury over HP/2 to the neck hit location as a crippling injury which crushes the windpipe, causing choking. Treat as spine if from rear";
                                crittable = "Body";
                                break;
                            default:
                                loc = "Neck";
                                wm = "x1";
                                wn =
                                    "Bleed at 30 seconds not 1 minute; -2 bleed penalty.";
                                crittable = "Body";
                        }
                }
                break;
			case 40:
				switch (subtable) {
					case 1: // ===== Homogenous Wounding Modifiers
						switch (dtype) {
							case "imp":
							case "pi++":
								loc = "Weapon";
								wm = "x1/2";
								wn = "";
								crittable = "Body";
								break;
							case "pi+":
								loc = "Weapon";
								wm = "x1/3";
								wn = "";
								crittable = "Body";
								break;
							case "pi":
								loc = "Weapon";
								wm = "x1/5";
								wn = "";
								crittable = "Body";
								break;
							case "pi-":
								loc = "Weapon";
								wm = "x1/10";
								wn = "";
								crittable = "Body";
								break;
							default:
								loc = "Weapon";
								wm = "x1";
								wn = "";
								crittable = "Body";
								break;
						}
				}
		}

        // ========== Roll Logic ==========
        // A roll of 3 or 4 is always a critical success.
        // A critical hit is a critical success scored on an attack.
        if (roll === 3 || roll === 4) {
            success = "Critical Hit";
            fail = "";
            if (whisper === "public") {
                sendChat(msg.who, `&{template:GURPSDAMAGE} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
            } else if (whisper === "secret") {
                sendChat(msg.who, `/w gm &{template:GURPSDAMAGEGM} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
                sendChat(msg.who, `/w ` + who + `&{template:GURPSDAMAGE} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
            } else if (whisper === "gm") {
                sendChat(msg.who, `/w gm &{template:GURPSDAMAGEGM} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
				
                sendChat(msg.who, `&{template:GURPSGMROLLING} {{gmrolling=${gmrolling}}}`);
            }
        }
        // A roll of 5 is a critical success if your effective skill is 15+.
        else if (roll === 5 && level >= 15) {
            success = "Critical Hit";
            fail = "";
            if (whisper === "public") {
                sendChat(msg.who, `&{template:GURPSDAMAGE} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
            } else if (whisper === "secret") {
                sendChat(msg.who, `/w gm &{template:GURPSDAMAGEGM} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
                sendChat(msg.who, `/w ` + who + `&{template:GURPSDAMAGE} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
            } else if (whisper === "gm") {
                sendChat(msg.who, `/w gm &{template:GURPSDAMAGEGM} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
				
                sendChat(msg.who, `&{template:GURPSGMROLLING} {{gmrolling=${gmrolling}}}`);
            }
        }
        // A roll of 6 is a critical success if your effective skill is 16+.
        else if (roll === 6 && level >= 16) {
            success = "Critical Hit";
            fail = "";
            if (whisper === "public") {
                sendChat(msg.who, `&{template:GURPSDAMAGE} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
            } else if (whisper === "secret") {
                sendChat(msg.who, `/w gm &{template:GURPSDAMAGEGM} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
                sendChat(msg.who, `/w ` + who + `&{template:GURPSDAMAGE} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
            } else if (whisper === "gm") {
                sendChat(msg.who, `/w gm &{template:GURPSDAMAGEGM} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
				
                sendChat(msg.who, `&{template:GURPSGMROLLING} {{gmrolling=${gmrolling}}}`);
            }
        } // A roll equal to or less than your effective skill is a success.
        else if (roll < 17 && roll <= level) {
            success = "Hit by a margin of: " + margin;
            fail = "";
            if (whisper === "public") {
                sendChat(msg.who, `&{template:GURPSDAMAGE} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
            } else if (whisper === "secret") {
                sendChat(msg.who, `/w gm &{template:GURPSDAMAGEGM} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
                sendChat(msg.who, `/w ` + who + `&{template:GURPSDAMAGE} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
            } else if (whisper === "gm") {
                sendChat(msg.who, `/w gm &{template:GURPSDAMAGEGM} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
				
                sendChat(msg.who, `&{template:GURPSGMROLLING} {{gmrolling=${gmrolling}}}`);
            }
        }
        // A roll of 18 is always a critical failure.
        else if (roll === 18) {
            fail = "Critical Miss";
            success = "";
            if (unarmed === 1) {
                crittable = "unarmed";
            } else crittable = "armed";
        }
        // A roll of 17 is a critical failure if your effective skill is 15 or less; otherwise, it is an ordinary failure.
        else if (roll === 17 && level <= 15) {
            fail = "Critical Miss";
            success = "";
            if (unarmed === 1) {
                crittable = "unarmed";
            } else crittable = "armed";
        } else if (roll > level && margin >= 10) {
            fail = "Critical Miss";
            success = "";
            if (unarmed === 1) {
                crittable = "unarmed";
            } else crittable = "armed";
        } else if (roll === 17 && margin < 10) {
            fail = "Failure by a margin of: " + margin;
            success = "";
        } else if (roll > level) {
            fail = "Miss by a margin of: " + margin;
            success = "";
        }
        // Grand Unified Hit Location Table

        // Send Template to Chat	
        log(msg.content);

        if (whisper === "public") {
            sendChat(msg.who,
                `&{template:GURPSATTACK} {{charactername=${name}}} {{roll_name=@{${name}|${meleeBuilder(rowid,'weaponname')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success.toString()}}}  {{usage=${usage.toString()}}} {{fail=${fail.toString()}}} {{notes=${notes.toString()}}}`);
        } else if (whisper === "secret") {
            sendChat(msg.who, `/w gm &{template:GURPSATTACKGM} {{charactername=${name}}} {{roll_name=@{${name}|${meleeBuilder(rowid,'weaponname')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success.toString()}}} {{usage=${usage.toString()}}} {{fail=${fail.toString()}}} {{notes=${notes.toString()}}}`);

            sendChat(msg.who, `/w ` + who +
                `&{template:GURPSATTACK} {{charactername=${name}}} {{roll_name=@{${name}|${meleeBuilder(rowid,'weaponname')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success.toString()}}} {{usage=${usage.toString()}}} {{fail=${fail.toString()}}} {{notes=${notes.toString()}}}`);
        } else if (whisper === "gm") {
            sendChat(msg.who, `/w gm &{template:GURPSATTACKGM} {{charactername=${name}}} {{roll_name=@{${name}|${meleeBuilder(rowid,'weaponname')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success.toString()}}} {{usage=${usage.toString()}}} {{fail=${fail.toString()}}} {{notes=${notes.toString()}}}`);

            sendChat(msg.who, `&{template:GURPSGMROLLING} {{gmrolling=${gmrolling}}}`);
        }
    }
});

// Ranged
const rangedBuilder = (rowid, atk) => `repeating_ranged_${rowid}_${atk}`;
on("chat:message", function(msg) {

    if (msg.type === "api" && /^!ranged/.test(msg.content)) {
        // Variables from sheet
        var who = getObj('player', msg.playerid).get('_displayname')
            .split(' ')[0];
        let cmd = processInlinerolls(msg).split(/\s+/);
        var character = getObj('character', cmd[1]); // get character id
        let rowid = cmd[2]; // Get Row Id
        var name = getAttrByName(character.id, 'character_name');
        var whisper = getAttrByName(character.id, 'whispermode');
        var level = Number(cmd[3]); // target
        var rds = Number(cmd[4]); // Rounds fired
        var rcl = Number(cmd[5]); // Recoil
        var dam = String(cmd[6]); // damage
        var dtype = String(cmd[7]); // damage type
        var table = Number(cmd[8]); // Hit Location Table Roll
        var subtable = Number(cmd[9]); // Subtable Roll
        var notesOnOff = Number(cmd[10]); // Notes on/off
        var note = getAttrByName(character.id, rangedBuilder(rowid, 'notes'));
        var usage = getAttrByName(character.id, rangedBuilder(rowid, 'usage'));
		var gmrolling = who + " GM rolling dice!";
        // Variables from API
        var roll = Number(randomInteger(6) + randomInteger(6) + randomInteger(6));
        var margin = Math.abs(level - roll);
        var critroll = Number(randomInteger(6) + randomInteger(6) + randomInteger(6));
        var success;
        var fail;
        var loc;
        var wm;
        var wn;
        var crittable;
        var hits;
        var damrolls;
        var notes;
        // Start building template output
        if (notesOnOff === 1) {
            notes = note;
        } else {
            notes = "";
        }

        if (roll === 3 || roll === 4) {
            success = "Critical Hit";
            fail = "";
            hits = Math.max(1, (Math.floor(margin / rcl)));
            damrolls = Math.min(rds, hits);
            for (i = 0; i < damrolls; i++) {
                if (table === 0) {
                    tableroll = Number(randomInteger(6) + randomInteger(6) + randomInteger(6));
                } else {
                    tableroll = table
                }
                if (subtable === 0) {
                    subtableroll = randomInteger(6);
                } else {
                    subtableroll = subtable
                }
                switch (tableroll) {
                    case 3: // Skull
                    case 4:
                        switch (dtype) {
                            case "tox":
                                loc = "Skull";
                                wm = "x1";
                                wn = "";
                                crittable = "Head";
                                break;
                            default:
                                loc = "Skull";
                                wm = "x4";
                                wn = "any injury causing shock requires stun/knockdown roll, major wound roll -10 vs stun/knockdown; bleed at 30 seconds not 1 minute";
                                crittable = "Head";
                        }
                        break;
                    case 5: // Face Subtable locations pg 3. LOADOUTS: LOW-TECH ARMOR
                        switch (subtableroll) {
                            case 1:
                                switch (dtype) {
                                    case "cor":
                                        loc = "Jaw";
                                        wm = "x1 1/2";
                                        wn =
                                            "Any injury causing shock requires -1 stun/knockdown roll; major wound roll -6 to stun/knockdown";
                                        crittable = "Head";
                                        break;
                                    default:
                                        loc = "Jaw";
                                        wm = "x4";
                                        wn =
                                            "Any injury causing shock requires -1 stun/knockdown roll; major wound roll -6 to stun/knockdown";
                                        crittable = "Head";
                                }
                                break;
                            case 2:
                                switch (dtype) {
                                    case "cor":
                                        loc = "Nose";
                                        wm = "x1 1/2";
                                        wn =
                                            "Cripple over 1/4 HP and causes No Sense of Smell/Taste (non-cutting) or Appearance loss (cutting, x2 crippling threshold), non-cutting major wound -5 to stun/knockdown.";
                                        crittable = "Head";
                                        break;
                                    default:
                                        loc = "Nose";
                                        wm = "x4";
                                        wn =
                                            "Cripple over 1/4 HP and causes No Sense of Smell/Taste (non-cutting) or Appearance loss (cutting, x2 crippling threshold), non-cutting major wound -5 to stun/knockdown.";
                                        crittable = "Head";
                                }
                                break;
                            case 3:
                                switch (dtype) {
                                    case "cor":
                                        loc = "Ear";
                                        wm = "x1 1/2";
                                        wn =
                                            "Cripple over 1/4 HP, no -5 to stun/knockdown, major wound only on sever; lost ear causes Appearance penalties.";
                                        crittable = "Head";
                                        break;
                                    default:
                                        loc = "Ear";
                                        wm = "x4";
                                        wn =
                                            "Cripple over 1/4 HP, no -5 to stun/knockdown, major wound only on sever; lost ear causes Appearance penalties.";
                                        crittable = "Head";
                                }
                                break;
                            case 4:
                            case 5:
                                switch (dtype) {
                                    case "cor":
                                        loc = "Cheeks";
                                        wm = "x1 1/2";
                                        wn =
                                            "Any injury causing shock requires stun/knockdown roll, major wound roll -10 vs stun/knockdown; bleed at 30 seconds not 1 minute";
                                        crittable = "Head";
                                        break;
                                    default:
                                        loc = "Cheeks";
                                        wm = "x4";
                                        wn =
                                            "Any injury causing shock requires stun/knockdown roll, major wound roll -10 vs stun/knockdown; bleed at 30 seconds not 1 minute";
                                        crittable = "Head";
                                }
                                break;
                            case 6:
                                switch (dtype) {
                                    case "cor":
                                        loc = "Eye";
                                        wm = "x1 1/2";
                                        wn =
                                            "Cripple over 1/10 hp; otherwise skull hit w/no DR. Tox has no spec. effect beyond cripple; bleed at 30 seconds not 1 min.";
                                        crittable = "Head";
                                        break;
                                    case "tox":
                                        loc = "Eye";
                                        wm = "x1";
                                        wn =
                                            "Cripple over 1/10 hp; otherwise skull hit w/no DR. Tox has no spec. effect beyond cripple; bleed at 30 seconds not 1 min.";
                                        crittable = "Head";
                                        break;
                                    default:
                                        loc = "Eye";
                                        wm = "x4";
                                        wn =
                                            "Cripple over 1/10 hp; otherwise skull hit w/no DR. Tox has no spec. effect beyond cripple; bleed at 30 seconds not 1 min.";
                                        crittable = "Head";
                                }
                                break;
                        }
                        break;
                    case 6: // Leg (Right)
                    case 7:
                        switch (subtableroll) {
                            case 1:
                            case 2:
                            case 3:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Shin (Right)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Shin (Right)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Shin (Right)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 4:
                                switch (dtype) {
                                    case "cr":
                                        loc = "Knee (Right)";
                                        wm = "x1";
                                        wn =
                                            "As per limb but cripple over 1/3 HP; dismember as per limb, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    case "pi-":
                                        loc = "Leg (Right)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Leg (Right)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Leg (Right)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 5:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Thigh (Right)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Thigh (Right)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Thigh (Right)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 6:
                                // Limb Vein/Artery cut & pi+ x2 , imp & pi++ x2.5, pi- x1, pi & bu (tb) x1.5 only
                                switch (dtype) {
                                    case "pi-":
                                    case "butb":
                                        loc = "Thigh Right (Vein/artery)";
                                        wm = "x1";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "pi":
                                        loc = "Thigh Right (Vein/artery)";
                                        wm = "x1 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Thigh Right(Vein/artery)";
                                        wm = "x2 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Thigh Right (Vein/artery))";
                                        wm = "x2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cor":
                                    case "cr":
                                        loc = "Thigh (Right)";
                                        wm = "x2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Thigh (Right)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                        }
                        break;
                    case 8: // Arm (Right)
                        switch (subtableroll) {
                            case 1:
                            case 2:
                            case 3:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Forearm (Right)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Forearm (Right)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Forearm (Right)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 4:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Elbow (Right)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Elbow (Right)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cr":
                                        loc = "Elbow (Right)";
                                        wm = "x1 1/2";
                                        wn =
                                            "Miss by 1 hit limb; as per limb but cripple over 1/3 HP; dismember as per limb, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Elbow (Right)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 5:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Upper Arm (Right)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Upper Arm (Right)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Upper Arm (Right)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 6:
                                // Limb Vein/Artery cut & pi+ x2 , imp & pi++ x2.5, pi- x1, pi & bu (tb) x1.5 only
                                switch (dtype) {
                                    case "pi-":
                                    case "butb":
                                        loc = "Shoulder Right (Vein/Artery)";
                                        wm = "x1";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "pi":
                                    case "bu(tb)":
                                        loc = "Shoulder Right (Vein/Artery)";
                                        wm = "x1 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Shoulder Right (Vein/Artery)";
                                        wm = "x2 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Shoulder Right (Vein/Artery)";
                                        wm = "x2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Shoulder Right";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                        }
                        break;
                    case 9: // Chest
                    case 10:
                        switch (subtableroll) {
                            case 1: // Vitals cr, imp, pi, or tight-beam burning only
                                switch (dtype) {
                                    case "pi-":
                                    case "pi":
                                    case "pi+":
                                    case "pi++":
                                    case "imp":
                                        loc = "Vitals";
                                        wm = "x3";
                                        wn =
                                            "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty.";
                                        crittable = "Body";
                                        break;
                                    case "butb":
                                        loc = "Vitals";
                                        wm = "x2";
                                        wn =
                                            "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty.";
                                        crittable = "Body";
                                        break;
                                    case "cr":
                                        loc = "Vitals";
                                        wm = "x1";
                                        wn =
                                            "HT roll for Knockdown, if major wound -5 stun/knockdown roll;<br /> injury can't exceed 2xHP (1xHP if using bleeding);<br />any excess is lost -4 bleed penalty.<br />If from behind treat as Spine.";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Chest";
                                        wm = "x1 1/2";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Chest";
                                        wm = "x1";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                        crittable = "Body";
                                }
                                break;
                            case 7:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Spine";
                                        wm = "x1/2";
                                        wn = "Miss by 1 hit chest; 3 DR; as per chest (injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost) but enough injury for shock penalty (even with HPT) gives stun/knockdown, -5 if a major wound. Cripple over 1xHP Bad Back (Severe) and Lame (Paraplegic) until healed";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Spine";
                                        wm = "x1 1/2";
                                        wn = "Miss by 1 hit chest; 3 DR; as per chest (injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost) but enough injury for shock penalty (even with HPT) gives stun/knockdown, -5 if a major wound. Cripple over 1xHP Bad Back (Severe) and Lame (Paraplegic) until healed";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Spine";
                                        wm = "x2";
                                        wn = "Miss by 1 hit chest; 3 DR; as per chest (injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost) but enough injury for shock penalty (even with HPT) gives stun/knockdown, -5 if a major wound. Cripple over 1xHP Bad Back (Severe) and Lame (Paraplegic) until healed";
                                        crittable = "Body";
                                        break;
                                    case "pi":
                                    case "butb":
                                        loc = "Spine";
                                        wm = "x2";
                                        wn = "Miss by 1 hit chest; 3 DR; as per chest (injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost) but enough injury for shock penalty (even with HPT) gives stun/knockdown, -5 if a major wound. Cripple over 1xHP Bad Back (Severe) and Lame (Paraplegic) until healed";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Spine";
                                        wm = "x1";
                                        wn = "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                        crittable = "Body";
                                }
                                break;
                            case 8:
                                switch (dtype) {
                                    case "pi-":
                                    case "pi":
                                    case "pi+":
                                    case "pi++":
                                    case "imp":
                                        loc = "Heart";
                                        wm = "x3";
                                        wn =
                                            "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty. May be special for some characters (e.g. Vampires).";
                                        crittable = "Body";
                                        break;
                                    case "butb":
                                        loc = "Heart";
                                        wm = "x2";
                                        wn =
                                            "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty. May be special for some characters (e.g. Vampires).";
                                        crittable = "Body";
                                        break;
                                    case "cr":
                                        loc = "Heart";
                                        wm = "x1";
                                        wn =
                                            "HT roll for Knockdown, if major wound -5 stun/knockdown roll;<br /> injury can't exceed 2xHP (1xHP if using bleeding);<br />any excess is lost -4 bleed penalty.<br />If from behind treat as Spine. May be special for some characters (e.g. Vampires). ";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Chest";
                                        wm = "x1 1/2";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost.";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Chest";
                                        wm = "x1";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost.";
                                        crittable = "Body";
                                }
                                break;
                            default:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Chest";
                                        wm = "x1/2";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Chest";
                                        wm = "x1 1/2";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Chest";
                                        wm = "x2";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Chest";
                                        wm = "x1";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                        crittable = "Body";
                                }
                        }
                        break;
                    case 11: // Abdomen Subtable locations pg 4. LOADOUTS: LOW-TECH ARMOR
                        switch (subtableroll) {
                            case 1:
                                switch (dtype) {
                                    case "cr":
                                    case "cor":
                                    case "burn":
                                    case "fat":
                                    case "tox":
                                    case "spcl":
                                        loc = "Vitals";
                                        wm = "x1";
                                        wn =
                                            "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty.";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Vitals";
                                        wm = "x1 1/2";
                                        wn =
                                            "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty. If from behind treart as Spine.";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Vitals";
                                        wm = "x3";
                                        wn =
                                            "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty";
                                        crittable = "Body";
                                }
                                break;
                            case 2:
                            case 3:
                            case 4:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Digestive Tract";
                                        wm = "x1/2";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound HT-3 to avoid special";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Digestive Tract";
                                        wm = "x1 1/2";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound HT-3 to avoid special";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Digestive Tract";
                                        wm = "x2";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound HT-3 to avoid special";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Digestive Tract";
                                        wm = "x1";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound HT-3 to avoid special";
                                        crittable = "Body";
                                }
                                break;
                            case 5:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Pelvis";
                                        wm = "x1/2";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound: fall down, cannot stand, Lame (Missing Legs) until healed";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Pelvis";
                                        wm = "x1 1/2";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound: fall down, cannot stand, Lame (Missing Legs) until healed";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Pelvis";
                                        wm = "x2";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound: fall down, cannot stand, Lame (Missing Legs) until healed";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Pelvis";
                                        wm = "x1";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound: fall down, cannot stand, Lame (Missing Legs) until healed";
                                        crittable = "Body";
                                }
                                break;
                            case 6:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Groin";
                                        wm = "x1/2";
                                        wn = "double shock; major wound -5 stun/knockdown";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Groin";
                                        wm = "x1 1/2";
                                        wn = "double shock; major wound -5 stun/knockdown";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Groin";
                                        wm = "x2";
                                        wn = "double shock; major wound -5 stun/knockdown";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Groin";
                                        wm = "x1";
                                        wn = "double shock; major wound -5 stun/knockdown";
                                        crittable = "Body";
                                }
                                break;
                        }
                        break;
                    case 12: // Left Arm
                        switch (subtableroll) {
                            case 1:
                            case 2:
                            case 3:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Forearm (Left)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Forearm (Left)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Forearm (Left)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 4:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Elbow (Left)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Elbow (Left)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cr":
                                        loc = "Elbow (Left)";
                                        wm = "x1 1/2";
                                        wn =
                                            "Miss by 1 hit limb; as per limb but cripple over 1/3 HP; dismember as per limb, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Elbow (Left)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 5:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Upper Arm (Left)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Upper Arm (Left)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Upper Arm (Left)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 6:
                                // Limb Vein/Artery cut & pi+ x2 , imp & pi++ x2.5, pi- x1, pi & bu (tb) x1.5 only
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Shoulder Left (Vein/Artery)";
                                        wm = "x1";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "pi":
                                    case "butb":
                                        loc = "Shoulder Left (Vein/Artery)";
                                        wm = "x1 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Shoulder Left (Vein/Artery)";
                                        wm = "x2 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Shoulder Left (Vein/Artery)";
                                        wm = "x2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Shoulder Left";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                        }
                        break;
                    case 13: // Leg (Left)
                    case 14:
                        switch (subtableroll) {
                            case 1:
                            case 2:
                            case 3:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Shin (Left)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Shin (Left)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Shin (Left)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 4:
                                switch (dtype) {
                                    case "cr":
                                        loc = "Knee (Left)";
                                        wm = "x1";
                                        wn =
                                            "As per limb but cripple over 1/3 HP; dismember as per limb, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    case "pi-":
                                        loc = "Leg (Left)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Leg (Left)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Leg (Left)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 5:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Thigh (Left)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Thigh (Left)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Thigh (Left)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 6:
                                // Limb Vein/Artery cut & pi+ x2 , imp & pi++ x2.5, pi- x1, pi & bu (tb) x1.5 only
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Thigh Left (Vein/artery)";
                                        wm = "x1";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "pi":
                                        loc = "Thigh Left (Vein/artery)";
                                        wm = "x1 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Thigh Left(Vein/artery)";
                                        wm = "x2 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Thigh Left (Vein/artery)";
                                        wm = "x2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cor":
                                    case "cr":
                                        loc = "Thigh Left";
                                        wm = "x2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Thigh Left";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                        }
                        break;
                    case 15: // Hand Extremity
                        switch (subtableroll) {
                            case 1:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Hand Joint";
                                        wm = "x1/2";
                                        wn =
                                            "Miss by 1 hit extremity; as per extremity but cripple over 1/4 HP; dismember as per extremity, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Hand Joint";
                                        wm = "x1 1/2";
                                        wn =
                                            "Miss by 1 hit extremity; as per extremity but cripple over 1/4 HP; dismember as per extremity, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Hand Extremity";
                                        wm = "x1";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                }
                                break;
                            default:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Hand Extremity";
                                        wm = "x1/2";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Hand Extremity";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Hand Extremity";
                                        wm = "x1";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                }
                        }
                        break;
                    case 16: // Foot Extremity
                        switch (subtableroll) {
                            case 1:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Foot Joint";
                                        wm = "x1/2";
                                        wn =
                                            "Miss by 1 hit extremity; as per extremity but cripple over 1/4 HP; dismember as per extremity, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Foot Joint";
                                        wm = "x1 1/2";
                                        wn =
                                            "Miss by 1 hit extremity; as per extremity but cripple over 1/4 HP; dismember as per extremity, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Foot Extremity";
                                        wm = "x1";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                }
                                break;
                            default:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Foot Extremity";
                                        wm = "x1/2";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Foot Extremity";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Foot Extremity";
                                        wm = "x1";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                }
                        }
                        break;
                    case 17: // Neck
                    case 18:
                        switch (subtableroll) {
                            case 1:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Neck Vein/Artery";
                                        wm = "x1/2";
                                        wn =
                                            "Bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cr":
                                        loc = "Neck Windpipe";
                                        wm = "x2";
                                        wn =
                                            "Injury over HP/2 to the neck hit location as a crippling injury which crushes the windpipe, causing choking.";
                                        crittable = "Body";
                                        break;
                                    case "cor":
                                    case "imp":
                                    case "pi++":
                                        loc = "Neck Vein/Artery";
                                        wm = "x2";
                                        wn =
                                            "Bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Neck Vein/Artery";
                                        wm = "x2 1/2";
                                        wn =
                                            "Bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "pi+":
                                    case "butb":
                                        loc = "Neck Vein/Artery";
                                        wm = "x1 1/2";
                                        wn =
                                            "Bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Neck Vein/Artery";
                                        wm = "x1";
                                        wn =
                                            "Bleed at 30 seconds not 1 minute; -2 bleed penalty.";
                                        crittable = "Body";
                                }
                                break;
                            default:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Neck";
                                        wm = "x1/2";
                                        wn =
                                            "Bleed at 30 seconds not 1 minute; -2 bleed penalty.";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "imp":
                                    case "pi++":
                                        loc = "Neck";
                                        wm = "x2";
                                        wn =
                                            "Bleed at 30 seconds not 1 minute; -2 bleed penalty.";
                                        crittable = "Body";
                                        break;
                                    case "cor":
                                    case "pi":
                                        loc = "Neck";
                                        wm = "x1 1/2";
                                        wn =
                                            "Bleed at 30 seconds not 1 minute; -2 bleed penalty.";
                                        crittable = "Body";
                                        break;
                                    case "cr":
                                        loc = "Neck";
                                        wm = "x1 1/2";
                                        wn =
                                            "Injury over HP/2 to the neck hit location as a crippling injury which crushes the windpipe, causing choking. Treat as spine if from rear";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Neck";
                                        wm = "x1";
                                        wn =
                                            "Bleed at 30 seconds not 1 minute; -2 bleed penalty.";
                                        crittable = "Body";
                                }
                        }
                        break;
					case 40:
				switch (subtable) {
					case 1: // ===== Homogenous Wounding Modifiers
						switch (dtype) {
							case "imp":
							case "pi++":
								loc = "Weapon";
								wm = "x1/2";
								wn = "";
								crittable = "Body";
								break;
							case "pi+":
								loc = "Weapon";
								wm = "x1/3";
								wn = "";
								crittable = "Body";
								break;
							case "pi":
								loc = "Weapon";
								wm = "x1/5";
								wn = "";
								crittable = "Body";
								break;
							case "pi-":
								loc = "Weapon";
								wm = "x1/10";
								wn = "";
								crittable = "Body";
								break;
							default:
								loc = "Weapon";
								wm = "x1";
								wn = "";
								crittable = "Body";
								break;
						}
				}
                }

                if (whisper === "public") {
                    sendChat(msg.who, `&{template:GURPSDAMAGE} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
                } else if (whisper === "secret") {
                    sendChat(msg.who, `/w gm &{template:GURPSDAMAGEGM} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
                    sendChat(msg.who, `/w ` + who + `&{template:GURPSDAMAGEGM} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
                } else if (whisper === "gm") {
                    sendChat(msg.who, `/w gm &{template:GURPS} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
                }
            }
        } else if (roll === 5 && level >= 15) {
            success = "Critical Hit";
            fail = "";
            hits = Math.max(1, (Math.floor(margin / rcl)));
            damrolls = Math.min(rds, hits);
            for (i = 0; i < damrolls; i++) {
                if (table === 0) {
                    tableroll = Number(randomInteger(6) + randomInteger(6) + randomInteger(6));
                } else {
                    tableroll = table
                }
                if (subtable === 0) {
                    subtableroll = randomInteger(6);
                } else {
                    subtableroll = subtable
                }
                switch (tableroll) {
                    case 3: // Skull
                    case 4:
                        switch (dtype) {
                            case "tox":
                                loc = "Skull";
                                wm = "x1";
                                wn = "";
                                crittable = "Head";
                                break;
                            default:
                                loc = "Skull";
                                wm = "x4";
                                wn = "any injury causing shock requires stun/knockdown roll, major wound roll -10 vs stun/knockdown; bleed at 30 seconds not 1 minute";
                                crittable = "Head";
                        }
                        break;
                    case 5: // Face Subtable locations pg 3. LOADOUTS: LOW-TECH ARMOR
                        switch (subtableroll) {
                            case 1:
                                switch (dtype) {
                                    case "cor":
                                        loc = "Jaw";
                                        wm = "x1 1/2";
                                        wn =
                                            "Any injury causing shock requires -1 stun/knockdown roll; major wound roll -6 to stun/knockdown";
                                        crittable = "Head";
                                        break;
                                    default:
                                        loc = "Jaw";
                                        wm = "x4";
                                        wn =
                                            "Any injury causing shock requires -1 stun/knockdown roll; major wound roll -6 to stun/knockdown";
                                        crittable = "Head";
                                }
                                break;
                            case 2:
                                switch (dtype) {
                                    case "cor":
                                        loc = "Nose";
                                        wm = "x1 1/2";
                                        wn =
                                            "Cripple over 1/4 HP and causes No Sense of Smell/Taste (non-cutting) or Appearance loss (cutting, x2 crippling threshold), non-cutting major wound -5 to stun/knockdown.";
                                        crittable = "Head";
                                        break;
                                    default:
                                        loc = "Nose";
                                        wm = "x4";
                                        wn =
                                            "Cripple over 1/4 HP and causes No Sense of Smell/Taste (non-cutting) or Appearance loss (cutting, x2 crippling threshold), non-cutting major wound -5 to stun/knockdown.";
                                        crittable = "Head";
                                }
                                break;
                            case 3:
                                switch (dtype) {
                                    case "cor":
                                        loc = "Ear";
                                        wm = "x1 1/2";
                                        wn =
                                            "Cripple over 1/4 HP, no -5 to stun/knockdown, major wound only on sever; lost ear causes Appearance penalties.";
                                        crittable = "Head";
                                        break;
                                    default:
                                        loc = "Ear";
                                        wm = "x4";
                                        wn =
                                            "Cripple over 1/4 HP, no -5 to stun/knockdown, major wound only on sever; lost ear causes Appearance penalties.";
                                        crittable = "Head";
                                }
                                break;
                            case 4:
                            case 5:
                                switch (dtype) {
                                    case "cor":
                                        loc = "Cheeks";
                                        wm = "x1 1/2";
                                        wn =
                                            "Any injury causing shock requires stun/knockdown roll, major wound roll -10 vs stun/knockdown; bleed at 30 seconds not 1 minute";
                                        crittable = "Head";
                                        break;
                                    default:
                                        loc = "Cheeks";
                                        wm = "x4";
                                        wn =
                                            "Any injury causing shock requires stun/knockdown roll, major wound roll -10 vs stun/knockdown; bleed at 30 seconds not 1 minute";
                                        crittable = "Head";
                                }
                                break;
                            case 6:
                                switch (dtype) {
                                    case "cor":
                                        loc = "Eye";
                                        wm = "x1 1/2";
                                        wn =
                                            "Cripple over 1/10 hp; otherwise skull hit w/no DR. Tox has no spec. effect beyond cripple; bleed at 30 seconds not 1 min.";
                                        crittable = "Head";
                                        break;
                                    case "tox":
                                        loc = "Eye";
                                        wm = "x1";
                                        wn =
                                            "Cripple over 1/10 hp; otherwise skull hit w/no DR. Tox has no spec. effect beyond cripple; bleed at 30 seconds not 1 min.";
                                        crittable = "Head";
                                        break;
                                    default:
                                        loc = "Eye";
                                        wm = "x4";
                                        wn =
                                            "Cripple over 1/10 hp; otherwise skull hit w/no DR. Tox has no spec. effect beyond cripple; bleed at 30 seconds not 1 min.";
                                        crittable = "Head";
                                }
                                break;
                        }
                        break;
                    case 6: // Leg (Right)
                    case 7:
                        switch (subtableroll) {
                            case 1:
                            case 2:
                            case 3:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Shin (Right)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Shin (Right)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Shin (Right)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 4:
                                switch (dtype) {
                                    case "cr":
                                        loc = "Knee (Right)";
                                        wm = "x1";
                                        wn =
                                            "As per limb but cripple over 1/3 HP; dismember as per limb, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    case "pi-":
                                        loc = "Leg (Right)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Leg (Right)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Leg (Right)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 5:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Thigh (Right)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Thigh (Right)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Thigh (Right)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 6:
                                // Limb Vein/Artery cut & pi+ x2 , imp & pi++ x2.5, pi- x1, pi & bu (tb) x1.5 only
                                switch (dtype) {
                                    case "pi-":
                                    case "butb":
                                        loc = "Thigh Right (Vein/artery)";
                                        wm = "x1";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "pi":
                                        loc = "Thigh Right (Vein/artery)";
                                        wm = "x1 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Thigh Right(Vein/artery)";
                                        wm = "x2 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Thigh Right (Vein/artery))";
                                        wm = "x2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cor":
                                    case "cr":
                                        loc = "Thigh (Right)";
                                        wm = "x2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Thigh (Right)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                        }
                        break;
                    case 8: // Arm (Right)
                        switch (subtableroll) {
                            case 1:
                            case 2:
                            case 3:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Forearm (Right)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Forearm (Right)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Forearm (Right)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 4:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Elbow (Right)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Elbow (Right)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cr":
                                        loc = "Elbow (Right)";
                                        wm = "x1 1/2";
                                        wn =
                                            "Miss by 1 hit limb; as per limb but cripple over 1/3 HP; dismember as per limb, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Elbow (Right)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 5:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Upper Arm (Right)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Upper Arm (Right)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Upper Arm (Right)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 6:
                                // Limb Vein/Artery cut & pi+ x2 , imp & pi++ x2.5, pi- x1, pi & bu (tb) x1.5 only
                                switch (dtype) {
                                    case "pi-":
                                    case "butb":
                                        loc = "Shoulder Right (Vein/Artery)";
                                        wm = "x1";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "pi":
                                    case "bu(tb)":
                                        loc = "Shoulder Right (Vein/Artery)";
                                        wm = "x1 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Shoulder Right (Vein/Artery)";
                                        wm = "x2 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Shoulder Right (Vein/Artery)";
                                        wm = "x2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Shoulder Right";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                        }
                        break;
                    case 9: // Chest
                    case 10:
                        switch (subtableroll) {
                            case 1: // Vitals cr, imp, pi, or tight-beam burning only
                                switch (dtype) {
                                    case "pi-":
                                    case "pi":
                                    case "pi+":
                                    case "pi++":
                                    case "imp":
                                        loc = "Vitals";
                                        wm = "x3";
                                        wn =
                                            "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty.";
                                        crittable = "Body";
                                        break;
                                    case "butb":
                                        loc = "Vitals";
                                        wm = "x2";
                                        wn =
                                            "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty.";
                                        crittable = "Body";
                                        break;
                                    case "cr":
                                        loc = "Vitals";
                                        wm = "x1";
                                        wn =
                                            "HT roll for Knockdown, if major wound -5 stun/knockdown roll;<br /> injury can't exceed 2xHP (1xHP if using bleeding);<br />any excess is lost -4 bleed penalty.<br />If from behind treat as Spine.";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Chest";
                                        wm = "x1 1/2";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Chest";
                                        wm = "x1";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                        crittable = "Body";
                                }
                                break;
                            case 7:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Spine";
                                        wm = "x1/2";
                                        wn = "Miss by 1 hit chest; 3 DR; as per chest (injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost) but enough injury for shock penalty (even with HPT) gives stun/knockdown, -5 if a major wound. Cripple over 1xHP Bad Back (Severe) and Lame (Paraplegic) until healed";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Spine";
                                        wm = "x1 1/2";
                                        wn = "Miss by 1 hit chest; 3 DR; as per chest (injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost) but enough injury for shock penalty (even with HPT) gives stun/knockdown, -5 if a major wound. Cripple over 1xHP Bad Back (Severe) and Lame (Paraplegic) until healed";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Spine";
                                        wm = "x2";
                                        wn = "Miss by 1 hit chest; 3 DR; as per chest (injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost) but enough injury for shock penalty (even with HPT) gives stun/knockdown, -5 if a major wound. Cripple over 1xHP Bad Back (Severe) and Lame (Paraplegic) until healed";
                                        crittable = "Body";
                                        break;
                                    case "pi":
                                    case "butb":
                                        loc = "Spine";
                                        wm = "x2";
                                        wn = "Miss by 1 hit chest; 3 DR; as per chest (injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost) but enough injury for shock penalty (even with HPT) gives stun/knockdown, -5 if a major wound. Cripple over 1xHP Bad Back (Severe) and Lame (Paraplegic) until healed";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Spine";
                                        wm = "x1";
                                        wn = "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                        crittable = "Body";
                                }
                                break;
                            case 8:
                                switch (dtype) {
                                    case "pi-":
                                    case "pi":
                                    case "pi+":
                                    case "pi++":
                                    case "imp":
                                        loc = "Heart";
                                        wm = "x3";
                                        wn =
                                            "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty. May be special for some characters (e.g. Vampires).";
                                        crittable = "Body";
                                        break;
                                    case "butb":
                                        loc = "Heart";
                                        wm = "x2";
                                        wn =
                                            "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty. May be special for some characters (e.g. Vampires).";
                                        crittable = "Body";
                                        break;
                                    case "cr":
                                        loc = "Heart";
                                        wm = "x1";
                                        wn =
                                            "HT roll for Knockdown, if major wound -5 stun/knockdown roll;<br /> injury can't exceed 2xHP (1xHP if using bleeding);<br />any excess is lost -4 bleed penalty.<br />If from behind treat as Spine. May be special for some characters (e.g. Vampires). ";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Chest";
                                        wm = "x1 1/2";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost.";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Chest";
                                        wm = "x1";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost.";
                                        crittable = "Body";
                                }
                                break;
                            default:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Chest";
                                        wm = "x1/2";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Chest";
                                        wm = "x1 1/2";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Chest";
                                        wm = "x2";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Chest";
                                        wm = "x1";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                        crittable = "Body";
                                }
                        }
                        break;
                    case 11: // Abdomen Subtable locations pg 4. LOADOUTS: LOW-TECH ARMOR
                        switch (subtableroll) {
                            case 1:
                                switch (dtype) {
                                    case "cr":
                                    case "cor":
                                    case "burn":
                                    case "fat":
                                    case "tox":
                                    case "spcl":
                                        loc = "Vitals";
                                        wm = "x1";
                                        wn =
                                            "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty.";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Vitals";
                                        wm = "x1 1/2";
                                        wn =
                                            "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty. If from behind treart as Spine.";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Vitals";
                                        wm = "x3";
                                        wn =
                                            "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty";
                                        crittable = "Body";
                                }
                                break;
                            case 2:
                            case 3:
                            case 4:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Digestive Tract";
                                        wm = "x1/2";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound HT-3 to avoid special";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Digestive Tract";
                                        wm = "x1 1/2";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound HT-3 to avoid special";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Digestive Tract";
                                        wm = "x2";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound HT-3 to avoid special";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Digestive Tract";
                                        wm = "x1";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound HT-3 to avoid special";
                                        crittable = "Body";
                                }
                                break;
                            case 5:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Pelvis";
                                        wm = "x1/2";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound: fall down, cannot stand, Lame (Missing Legs) until healed";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Pelvis";
                                        wm = "x1 1/2";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound: fall down, cannot stand, Lame (Missing Legs) until healed";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Pelvis";
                                        wm = "x2";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound: fall down, cannot stand, Lame (Missing Legs) until healed";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Pelvis";
                                        wm = "x1";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound: fall down, cannot stand, Lame (Missing Legs) until healed";
                                        crittable = "Body";
                                }
                                break;
                            case 6:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Groin";
                                        wm = "x1/2";
                                        wn = "double shock; major wound -5 stun/knockdown";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Groin";
                                        wm = "x1 1/2";
                                        wn = "double shock; major wound -5 stun/knockdown";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Groin";
                                        wm = "x2";
                                        wn = "double shock; major wound -5 stun/knockdown";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Groin";
                                        wm = "x1";
                                        wn = "double shock; major wound -5 stun/knockdown";
                                        crittable = "Body";
                                }
                                break;
                        }
                        break;
                    case 12: // Left Arm
                        switch (subtableroll) {
                            case 1:
                            case 2:
                            case 3:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Forearm (Left)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Forearm (Left)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Forearm (Left)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 4:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Elbow (Left)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Elbow (Left)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cr":
                                        loc = "Elbow (Left)";
                                        wm = "x1 1/2";
                                        wn =
                                            "Miss by 1 hit limb; as per limb but cripple over 1/3 HP; dismember as per limb, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Elbow (Left)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 5:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Upper Arm (Left)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Upper Arm (Left)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Upper Arm (Left)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 6:
                                // Limb Vein/Artery cut & pi+ x2 , imp & pi++ x2.5, pi- x1, pi & bu (tb) x1.5 only
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Shoulder Left (Vein/Artery)";
                                        wm = "x1";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "pi":
                                    case "butb":
                                        loc = "Shoulder Left (Vein/Artery)";
                                        wm = "x1 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Shoulder Left (Vein/Artery)";
                                        wm = "x2 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Shoulder Left (Vein/Artery)";
                                        wm = "x2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Shoulder Left";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                        }
                        break;
                    case 13: // Leg (Left)
                    case 14:
                        switch (subtableroll) {
                            case 1:
                            case 2:
                            case 3:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Shin (Left)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Shin (Left)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Shin (Left)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 4:
                                switch (dtype) {
                                    case "cr":
                                        loc = "Knee (Left)";
                                        wm = "x1";
                                        wn =
                                            "As per limb but cripple over 1/3 HP; dismember as per limb, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    case "pi-":
                                        loc = "Leg (Left)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Leg (Left)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Leg (Left)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 5:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Thigh (Left)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Thigh (Left)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Thigh (Left)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 6:
                                // Limb Vein/Artery cut & pi+ x2 , imp & pi++ x2.5, pi- x1, pi & bu (tb) x1.5 only
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Thigh Left (Vein/artery)";
                                        wm = "x1";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "pi":
                                        loc = "Thigh Left (Vein/artery)";
                                        wm = "x1 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Thigh Left(Vein/artery)";
                                        wm = "x2 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Thigh Left (Vein/artery)";
                                        wm = "x2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cor":
                                    case "cr":
                                        loc = "Thigh Left";
                                        wm = "x2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Thigh Left";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                        }
                        break;
                    case 15: // Hand Extremity
                        switch (subtableroll) {
                            case 1:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Hand Joint";
                                        wm = "x1/2";
                                        wn =
                                            "Miss by 1 hit extremity; as per extremity but cripple over 1/4 HP; dismember as per extremity, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Hand Joint";
                                        wm = "x1 1/2";
                                        wn =
                                            "Miss by 1 hit extremity; as per extremity but cripple over 1/4 HP; dismember as per extremity, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Hand Extremity";
                                        wm = "x1";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                }
                                break;
                            default:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Hand Extremity";
                                        wm = "x1/2";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Hand Extremity";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Hand Extremity";
                                        wm = "x1";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                }
                        }
                        break;
                    case 16: // Foot Extremity
                        switch (subtableroll) {
                            case 1:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Foot Joint";
                                        wm = "x1/2";
                                        wn =
                                            "Miss by 1 hit extremity; as per extremity but cripple over 1/4 HP; dismember as per extremity, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Foot Joint";
                                        wm = "x1 1/2";
                                        wn =
                                            "Miss by 1 hit extremity; as per extremity but cripple over 1/4 HP; dismember as per extremity, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Foot Extremity";
                                        wm = "x1";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                }
                                break;
                            default:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Foot Extremity";
                                        wm = "x1/2";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Foot Extremity";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Foot Extremity";
                                        wm = "x1";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                }
                        }
                        break;
                    case 17: // Neck
                    case 18:
                        switch (subtableroll) {
                            case 1:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Neck Vein/Artery";
                                        wm = "x1/2";
                                        wn =
                                            "Bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cr":
                                        loc = "Neck Windpipe";
                                        wm = "x2";
                                        wn =
                                            "Injury over HP/2 to the neck hit location as a crippling injury which crushes the windpipe, causing choking.";
                                        crittable = "Body";
                                        break;
                                    case "cor":
                                    case "imp":
                                    case "pi++":
                                        loc = "Neck Vein/Artery";
                                        wm = "x2";
                                        wn =
                                            "Bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Neck Vein/Artery";
                                        wm = "x2 1/2";
                                        wn =
                                            "Bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "pi+":
                                    case "butb":
                                        loc = "Neck Vein/Artery";
                                        wm = "x1 1/2";
                                        wn =
                                            "Bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Neck Vein/Artery";
                                        wm = "x1";
                                        wn =
                                            "Bleed at 30 seconds not 1 minute; -2 bleed penalty.";
                                        crittable = "Body";
                                }
                                break;
                            default:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Neck";
                                        wm = "x1/2";
                                        wn =
                                            "Bleed at 30 seconds not 1 minute; -2 bleed penalty.";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "imp":
                                    case "pi++":
                                        loc = "Neck";
                                        wm = "x2";
                                        wn =
                                            "Bleed at 30 seconds not 1 minute; -2 bleed penalty.";
                                        crittable = "Body";
                                        break;
                                    case "cor":
                                    case "pi":
                                        loc = "Neck";
                                        wm = "x1 1/2";
                                        wn =
                                            "Bleed at 30 seconds not 1 minute; -2 bleed penalty.";
                                        crittable = "Body";
                                        break;
                                    case "cr":
                                        loc = "Neck";
                                        wm = "x1 1/2";
                                        wn =
                                            "Injury over HP/2 to the neck hit location as a crippling injury which crushes the windpipe, causing choking. Treat as spine if from rear";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Neck";
                                        wm = "x1";
                                        wn =
                                            "Bleed at 30 seconds not 1 minute; -2 bleed penalty.";
                                        crittable = "Body";
                                }
                        }
                        break;
					case 40:
				switch (subtable) {
					case 1: // ===== Homogenous Wounding Modifiers
						switch (dtype) {
							case "imp":
							case "pi++":
								loc = "Weapon";
								wm = "x1/2";
								wn = "";
								crittable = "Body";
								break;
							case "pi+":
								loc = "Weapon";
								wm = "x1/3";
								wn = "";
								crittable = "Body";
								break;
							case "pi":
								loc = "Weapon";
								wm = "x1/5";
								wn = "";
								crittable = "Body";
								break;
							case "pi-":
								loc = "Weapon";
								wm = "x1/10";
								wn = "";
								crittable = "Body";
								break;
							default:
								loc = "Weapon";
								wm = "x1";
								wn = "";
								crittable = "Body";
								break;
						}
				}				
        }

                if (whisper === "public") {
                    sendChat(msg.who, `&{template:GURPSDAMAGE} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
                } else if (whisper === "secret") {
                    sendChat(msg.who, `/w gm &{template:GURPSDAMAGEGM} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
                    sendChat(msg.who, `/w ` + who + `&{template:GURPSDAMAGE} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
                } else if (whisper === "gm") {
                    sendChat(msg.who, `/w gm &{template:GURPSDAMAGEGM} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
                }
                i++;
            }
        } else if (roll === 6 && level >= 16) {
            success = "Critical Hit";
            fail = "";
            hits = Math.max(1, (Math.floor(margin / rcl)));
            damrolls = Math.min(rds, hits);
            for (i = 0; i < damrolls; i++) {
                if (table === 0) {
                    tableroll = Number(randomInteger(6) + randomInteger(6) + randomInteger(6));
                } else {
                    tableroll = table
                }
                if (subtable === 0) {
                    subtableroll = randomInteger(6);
                } else {
                    subtableroll = subtable
                }
                switch (tableroll) {
                    case 3: // Skull
                    case 4:
                        switch (dtype) {
                            case "tox":
                                loc = "Skull";
                                wm = "x1";
                                wn = "";
                                crittable = "Head";
                                break;
                            default:
                                loc = "Skull";
                                wm = "x4";
                                wn = "any injury causing shock requires stun/knockdown roll, major wound roll -10 vs stun/knockdown; bleed at 30 seconds not 1 minute";
                                crittable = "Head";
                        }
                        break;
                    case 5: // Face Subtable locations pg 3. LOADOUTS: LOW-TECH ARMOR
                        switch (subtableroll) {
                            case 1:
                                switch (dtype) {
                                    case "cor":
                                        loc = "Jaw";
                                        wm = "x1 1/2";
                                        wn =
                                            "Any injury causing shock requires -1 stun/knockdown roll; major wound roll -6 to stun/knockdown";
                                        crittable = "Head";
                                        break;
                                    default:
                                        loc = "Jaw";
                                        wm = "x4";
                                        wn =
                                            "Any injury causing shock requires -1 stun/knockdown roll; major wound roll -6 to stun/knockdown";
                                        crittable = "Head";
                                }
                                break;
                            case 2:
                                switch (dtype) {
                                    case "cor":
                                        loc = "Nose";
                                        wm = "x1 1/2";
                                        wn =
                                            "Cripple over 1/4 HP and causes No Sense of Smell/Taste (non-cutting) or Appearance loss (cutting, x2 crippling threshold), non-cutting major wound -5 to stun/knockdown.";
                                        crittable = "Head";
                                        break;
                                    default:
                                        loc = "Nose";
                                        wm = "x4";
                                        wn =
                                            "Cripple over 1/4 HP and causes No Sense of Smell/Taste (non-cutting) or Appearance loss (cutting, x2 crippling threshold), non-cutting major wound -5 to stun/knockdown.";
                                        crittable = "Head";
                                }
                                break;
                            case 3:
                                switch (dtype) {
                                    case "cor":
                                        loc = "Ear";
                                        wm = "x1 1/2";
                                        wn =
                                            "Cripple over 1/4 HP, no -5 to stun/knockdown, major wound only on sever; lost ear causes Appearance penalties.";
                                        crittable = "Head";
                                        break;
                                    default:
                                        loc = "Ear";
                                        wm = "x4";
                                        wn =
                                            "Cripple over 1/4 HP, no -5 to stun/knockdown, major wound only on sever; lost ear causes Appearance penalties.";
                                        crittable = "Head";
                                }
                                break;
                            case 4:
                            case 5:
                                switch (dtype) {
                                    case "cor":
                                        loc = "Cheeks";
                                        wm = "x1 1/2";
                                        wn =
                                            "Any injury causing shock requires stun/knockdown roll, major wound roll -10 vs stun/knockdown; bleed at 30 seconds not 1 minute";
                                        crittable = "Head";
                                        break;
                                    default:
                                        loc = "Cheeks";
                                        wm = "x4";
                                        wn =
                                            "Any injury causing shock requires stun/knockdown roll, major wound roll -10 vs stun/knockdown; bleed at 30 seconds not 1 minute";
                                        crittable = "Head";
                                }
                                break;
                            case 6:
                                switch (dtype) {
                                    case "cor":
                                        loc = "Eye";
                                        wm = "x1 1/2";
                                        wn =
                                            "Cripple over 1/10 hp; otherwise skull hit w/no DR. Tox has no spec. effect beyond cripple; bleed at 30 seconds not 1 min.";
                                        crittable = "Head";
                                        break;
                                    case "tox":
                                        loc = "Eye";
                                        wm = "x1";
                                        wn =
                                            "Cripple over 1/10 hp; otherwise skull hit w/no DR. Tox has no spec. effect beyond cripple; bleed at 30 seconds not 1 min.";
                                        crittable = "Head";
                                        break;
                                    default:
                                        loc = "Eye";
                                        wm = "x4";
                                        wn =
                                            "Cripple over 1/10 hp; otherwise skull hit w/no DR. Tox has no spec. effect beyond cripple; bleed at 30 seconds not 1 min.";
                                        crittable = "Head";
                                }
                                break;
                        }
                        break;
                    case 6: // Leg (Right)
                    case 7:
                        switch (subtableroll) {
                            case 1:
                            case 2:
                            case 3:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Shin (Right)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Shin (Right)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Shin (Right)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 4:
                                switch (dtype) {
                                    case "cr":
                                        loc = "Knee (Right)";
                                        wm = "x1";
                                        wn =
                                            "As per limb but cripple over 1/3 HP; dismember as per limb, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    case "pi-":
                                        loc = "Leg (Right)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Leg (Right)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Leg (Right)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 5:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Thigh (Right)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Thigh (Right)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Thigh (Right)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 6:
                                // Limb Vein/Artery cut & pi+ x2 , imp & pi++ x2.5, pi- x1, pi & bu (tb) x1.5 only
                                switch (dtype) {
                                    case "pi-":
                                    case "butb":
                                        loc = "Thigh Right (Vein/artery)";
                                        wm = "x1";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "pi":
                                        loc = "Thigh Right (Vein/artery)";
                                        wm = "x1 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Thigh Right(Vein/artery)";
                                        wm = "x2 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Thigh Right (Vein/artery))";
                                        wm = "x2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cor":
                                    case "cr":
                                        loc = "Thigh (Right)";
                                        wm = "x2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Thigh (Right)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                        }
                        break;
                    case 8: // Arm (Right)
                        switch (subtableroll) {
                            case 1:
                            case 2:
                            case 3:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Forearm (Right)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Forearm (Right)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Forearm (Right)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 4:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Elbow (Right)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Elbow (Right)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cr":
                                        loc = "Elbow (Right)";
                                        wm = "x1 1/2";
                                        wn =
                                            "Miss by 1 hit limb; as per limb but cripple over 1/3 HP; dismember as per limb, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Elbow (Right)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 5:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Upper Arm (Right)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Upper Arm (Right)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Upper Arm (Right)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 6:
                                // Limb Vein/Artery cut & pi+ x2 , imp & pi++ x2.5, pi- x1, pi & bu (tb) x1.5 only
                                switch (dtype) {
                                    case "pi-":
                                    case "butb":
                                        loc = "Shoulder Right (Vein/Artery)";
                                        wm = "x1";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "pi":
                                    case "bu(tb)":
                                        loc = "Shoulder Right (Vein/Artery)";
                                        wm = "x1 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Shoulder Right (Vein/Artery)";
                                        wm = "x2 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Shoulder Right (Vein/Artery)";
                                        wm = "x2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Shoulder Right";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                        }
                        break;
                    case 9: // Chest
                    case 10:
                        switch (subtableroll) {
                            case 1: // Vitals cr, imp, pi, or tight-beam burning only
                                switch (dtype) {
                                    case "pi-":
                                    case "pi":
                                    case "pi+":
                                    case "pi++":
                                    case "imp":
                                        loc = "Vitals";
                                        wm = "x3";
                                        wn =
                                            "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty.";
                                        crittable = "Body";
                                        break;
                                    case "butb":
                                        loc = "Vitals";
                                        wm = "x2";
                                        wn =
                                            "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty.";
                                        crittable = "Body";
                                        break;
                                    case "cr":
                                        loc = "Vitals";
                                        wm = "x1";
                                        wn =
                                            "HT roll for Knockdown, if major wound -5 stun/knockdown roll;<br /> injury can't exceed 2xHP (1xHP if using bleeding);<br />any excess is lost -4 bleed penalty.<br />If from behind treat as Spine.";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Chest";
                                        wm = "x1 1/2";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Chest";
                                        wm = "x1";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                        crittable = "Body";
                                }
                                break;
                            case 7:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Spine";
                                        wm = "x1/2";
                                        wn = "Miss by 1 hit chest; 3 DR; as per chest (injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost) but enough injury for shock penalty (even with HPT) gives stun/knockdown, -5 if a major wound. Cripple over 1xHP Bad Back (Severe) and Lame (Paraplegic) until healed";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Spine";
                                        wm = "x1 1/2";
                                        wn = "Miss by 1 hit chest; 3 DR; as per chest (injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost) but enough injury for shock penalty (even with HPT) gives stun/knockdown, -5 if a major wound. Cripple over 1xHP Bad Back (Severe) and Lame (Paraplegic) until healed";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Spine";
                                        wm = "x2";
                                        wn = "Miss by 1 hit chest; 3 DR; as per chest (injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost) but enough injury for shock penalty (even with HPT) gives stun/knockdown, -5 if a major wound. Cripple over 1xHP Bad Back (Severe) and Lame (Paraplegic) until healed";
                                        crittable = "Body";
                                        break;
                                    case "pi":
                                    case "butb":
                                        loc = "Spine";
                                        wm = "x2";
                                        wn = "Miss by 1 hit chest; 3 DR; as per chest (injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost) but enough injury for shock penalty (even with HPT) gives stun/knockdown, -5 if a major wound. Cripple over 1xHP Bad Back (Severe) and Lame (Paraplegic) until healed";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Spine";
                                        wm = "x1";
                                        wn = "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                        crittable = "Body";
                                }
                                break;
                            case 8:
                                switch (dtype) {
                                    case "pi-":
                                    case "pi":
                                    case "pi+":
                                    case "pi++":
                                    case "imp":
                                        loc = "Heart";
                                        wm = "x3";
                                        wn =
                                            "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty. May be special for some characters (e.g. Vampires).";
                                        crittable = "Body";
                                        break;
                                    case "butb":
                                        loc = "Heart";
                                        wm = "x2";
                                        wn =
                                            "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty. May be special for some characters (e.g. Vampires).";
                                        crittable = "Body";
                                        break;
                                    case "cr":
                                        loc = "Heart";
                                        wm = "x1";
                                        wn =
                                            "HT roll for Knockdown, if major wound -5 stun/knockdown roll;<br /> injury can't exceed 2xHP (1xHP if using bleeding);<br />any excess is lost -4 bleed penalty.<br />If from behind treat as Spine. May be special for some characters (e.g. Vampires). ";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Chest";
                                        wm = "x1 1/2";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost.";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Chest";
                                        wm = "x1";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost.";
                                        crittable = "Body";
                                }
                                break;
                            default:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Chest";
                                        wm = "x1/2";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Chest";
                                        wm = "x1 1/2";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Chest";
                                        wm = "x2";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Chest";
                                        wm = "x1";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                        crittable = "Body";
                                }
                        }
                        break;
                    case 11: // Abdomen Subtable locations pg 4. LOADOUTS: LOW-TECH ARMOR
                        switch (subtableroll) {
                            case 1:
                                switch (dtype) {
                                    case "cr":
                                    case "cor":
                                    case "burn":
                                    case "fat":
                                    case "tox":
                                    case "spcl":
                                        loc = "Vitals";
                                        wm = "x1";
                                        wn =
                                            "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty.";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Vitals";
                                        wm = "x1 1/2";
                                        wn =
                                            "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty. If from behind treart as Spine.";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Vitals";
                                        wm = "x3";
                                        wn =
                                            "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty";
                                        crittable = "Body";
                                }
                                break;
                            case 2:
                            case 3:
                            case 4:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Digestive Tract";
                                        wm = "x1/2";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound HT-3 to avoid special";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Digestive Tract";
                                        wm = "x1 1/2";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound HT-3 to avoid special";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Digestive Tract";
                                        wm = "x2";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound HT-3 to avoid special";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Digestive Tract";
                                        wm = "x1";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound HT-3 to avoid special";
                                        crittable = "Body";
                                }
                                break;
                            case 5:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Pelvis";
                                        wm = "x1/2";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound: fall down, cannot stand, Lame (Missing Legs) until healed";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Pelvis";
                                        wm = "x1 1/2";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound: fall down, cannot stand, Lame (Missing Legs) until healed";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Pelvis";
                                        wm = "x2";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound: fall down, cannot stand, Lame (Missing Legs) until healed";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Pelvis";
                                        wm = "x1";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound: fall down, cannot stand, Lame (Missing Legs) until healed";
                                        crittable = "Body";
                                }
                                break;
                            case 6:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Groin";
                                        wm = "x1/2";
                                        wn = "double shock; major wound -5 stun/knockdown";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Groin";
                                        wm = "x1 1/2";
                                        wn = "double shock; major wound -5 stun/knockdown";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Groin";
                                        wm = "x2";
                                        wn = "double shock; major wound -5 stun/knockdown";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Groin";
                                        wm = "x1";
                                        wn = "double shock; major wound -5 stun/knockdown";
                                        crittable = "Body";
                                }
                                break;
                        }
                        break;
                    case 12: // Left Arm
                        switch (subtableroll) {
                            case 1:
                            case 2:
                            case 3:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Forearm (Left)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Forearm (Left)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Forearm (Left)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 4:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Elbow (Left)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Elbow (Left)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cr":
                                        loc = "Elbow (Left)";
                                        wm = "x1 1/2";
                                        wn =
                                            "Miss by 1 hit limb; as per limb but cripple over 1/3 HP; dismember as per limb, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Elbow (Left)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 5:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Upper Arm (Left)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Upper Arm (Left)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Upper Arm (Left)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 6:
                                // Limb Vein/Artery cut & pi+ x2 , imp & pi++ x2.5, pi- x1, pi & bu (tb) x1.5 only
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Shoulder Left (Vein/Artery)";
                                        wm = "x1";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "pi":
                                    case "butb":
                                        loc = "Shoulder Left (Vein/Artery)";
                                        wm = "x1 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Shoulder Left (Vein/Artery)";
                                        wm = "x2 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Shoulder Left (Vein/Artery)";
                                        wm = "x2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Shoulder Left";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                        }
                        break;
                    case 13: // Leg (Left)
                    case 14:
                        switch (subtableroll) {
                            case 1:
                            case 2:
                            case 3:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Shin (Left)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Shin (Left)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Shin (Left)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 4:
                                switch (dtype) {
                                    case "cr":
                                        loc = "Knee (Left)";
                                        wm = "x1";
                                        wn =
                                            "As per limb but cripple over 1/3 HP; dismember as per limb, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    case "pi-":
                                        loc = "Leg (Left)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Leg (Left)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Leg (Left)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 5:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Thigh (Left)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Thigh (Left)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Thigh (Left)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 6:
                                // Limb Vein/Artery cut & pi+ x2 , imp & pi++ x2.5, pi- x1, pi & bu (tb) x1.5 only
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Thigh Left (Vein/artery)";
                                        wm = "x1";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "pi":
                                        loc = "Thigh Left (Vein/artery)";
                                        wm = "x1 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Thigh Left(Vein/artery)";
                                        wm = "x2 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Thigh Left (Vein/artery)";
                                        wm = "x2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cor":
                                    case "cr":
                                        loc = "Thigh Left";
                                        wm = "x2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Thigh Left";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                        }
                        break;
                    case 15: // Hand Extremity
                        switch (subtableroll) {
                            case 1:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Hand Joint";
                                        wm = "x1/2";
                                        wn =
                                            "Miss by 1 hit extremity; as per extremity but cripple over 1/4 HP; dismember as per extremity, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Hand Joint";
                                        wm = "x1 1/2";
                                        wn =
                                            "Miss by 1 hit extremity; as per extremity but cripple over 1/4 HP; dismember as per extremity, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Hand Extremity";
                                        wm = "x1";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                }
                                break;
                            default:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Hand Extremity";
                                        wm = "x1/2";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Hand Extremity";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Hand Extremity";
                                        wm = "x1";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                }
                        }
                        break;
                    case 16: // Foot Extremity
                        switch (subtableroll) {
                            case 1:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Foot Joint";
                                        wm = "x1/2";
                                        wn =
                                            "Miss by 1 hit extremity; as per extremity but cripple over 1/4 HP; dismember as per extremity, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Foot Joint";
                                        wm = "x1 1/2";
                                        wn =
                                            "Miss by 1 hit extremity; as per extremity but cripple over 1/4 HP; dismember as per extremity, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Foot Extremity";
                                        wm = "x1";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                }
                                break;
                            default:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Foot Extremity";
                                        wm = "x1/2";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Foot Extremity";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Foot Extremity";
                                        wm = "x1";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                }
                        }
                        break;
                    case 17: // Neck
                    case 18:
                        switch (subtableroll) {
                            case 1:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Neck Vein/Artery";
                                        wm = "x1/2";
                                        wn =
                                            "Bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cr":
                                        loc = "Neck Windpipe";
                                        wm = "x2";
                                        wn =
                                            "Injury over HP/2 to the neck hit location as a crippling injury which crushes the windpipe, causing choking.";
                                        crittable = "Body";
                                        break;
                                    case "cor":
                                    case "imp":
                                    case "pi++":
                                        loc = "Neck Vein/Artery";
                                        wm = "x2";
                                        wn =
                                            "Bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Neck Vein/Artery";
                                        wm = "x2 1/2";
                                        wn =
                                            "Bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "pi+":
                                    case "butb":
                                        loc = "Neck Vein/Artery";
                                        wm = "x1 1/2";
                                        wn =
                                            "Bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Neck Vein/Artery";
                                        wm = "x1";
                                        wn =
                                            "Bleed at 30 seconds not 1 minute; -2 bleed penalty.";
                                        crittable = "Body";
                                }
                                break;
                            default:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Neck";
                                        wm = "x1/2";
                                        wn =
                                            "Bleed at 30 seconds not 1 minute; -2 bleed penalty.";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "imp":
                                    case "pi++":
                                        loc = "Neck";
                                        wm = "x2";
                                        wn =
                                            "Bleed at 30 seconds not 1 minute; -2 bleed penalty.";
                                        crittable = "Body";
                                        break;
                                    case "cor":
                                    case "pi":
                                        loc = "Neck";
                                        wm = "x1 1/2";
                                        wn =
                                            "Bleed at 30 seconds not 1 minute; -2 bleed penalty.";
                                        crittable = "Body";
                                        break;
                                    case "cr":
                                        loc = "Neck";
                                        wm = "x1 1/2";
                                        wn =
                                            "Injury over HP/2 to the neck hit location as a crippling injury which crushes the windpipe, causing choking. Treat as spine if from rear";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Neck";
                                        wm = "x1";
                                        wn =
                                            "Bleed at 30 seconds not 1 minute; -2 bleed penalty.";
                                        crittable = "Body";
                                }
                        }
                        break;
				case 40:
				switch (subtable) {
					case 1: // ===== Homogenous Wounding Modifiers
						switch (dtype) {
							case "imp":
							case "pi++":
								loc = "Weapon";
								wm = "x1/2";
								wn = "";
								crittable = "Body";
								break;
							case "pi+":
								loc = "Weapon";
								wm = "x1/3";
								wn = "";
								crittable = "Body";
								break;
							case "pi":
								loc = "Weapon";
								wm = "x1/5";
								wn = "";
								crittable = "Body";
								break;
							case "pi-":
								loc = "Weapon";
								wm = "x1/10";
								wn = "";
								crittable = "Body";
								break;
							default:
								loc = "Weapon";
								wm = "x1";
								wn = "";
								crittable = "Body";
								break;
						}
				}
        }

                if (whisper === "public") {
                    sendChat(msg.who, `&{template:GURPSDAMAGE} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
                } else if (whisper === "secret") {
                    sendChat(msg.who, `/w gm &{template:GURPSDAMAGEGM} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
                    sendChat(msg.who, `/w ` + who + `&{template:GURPSDAMAGE} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
                } else if (whisper === "gm") {
                    sendChat(msg.who, `/w gm &{template:GURPSDAMAGEGM} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
                }
            }
        } else if (roll < 17 && roll <= level) {
            success = "Hit by a margin of: " + margin;
            fail = "";
            hits = Math.max(1, (Math.floor(margin / rcl)));
            damrolls = Math.min(rds, hits);
            for (i = 0; i < damrolls; i++) {
                if (table === 0) {
                    tableroll = Number(randomInteger(6) + randomInteger(6) + randomInteger(6));
                } else {
                    tableroll = table
                }
                if (subtable === 0) {
                    subtableroll = randomInteger(6);
                } else {
                    subtableroll = subtable
                }
                switch (tableroll) {
                    case 3: // Skull
                    case 4:
                        switch (dtype) {
                            case "tox":
                                loc = "Skull";
                                wm = "x1";
                                wn = "";
                                crittable = "Head";
                                break;
                            default:
                                loc = "Skull";
                                wm = "x4";
                                wn = "any injury causing shock requires stun/knockdown roll, major wound roll -10 vs stun/knockdown; bleed at 30 seconds not 1 minute";
                                crittable = "Head";
                        }
                        break;
                    case 5: // Face Subtable locations pg 3. LOADOUTS: LOW-TECH ARMOR
                        switch (subtableroll) {
                            case 1:
                                switch (dtype) {
                                    case "cor":
                                        loc = "Jaw";
                                        wm = "x1 1/2";
                                        wn =
                                            "Any injury causing shock requires -1 stun/knockdown roll; major wound roll -6 to stun/knockdown";
                                        crittable = "Head";
                                        break;
                                    default:
                                        loc = "Jaw";
                                        wm = "x4";
                                        wn =
                                            "Any injury causing shock requires -1 stun/knockdown roll; major wound roll -6 to stun/knockdown";
                                        crittable = "Head";
                                }
                                break;
                            case 2:
                                switch (dtype) {
                                    case "cor":
                                        loc = "Nose";
                                        wm = "x1 1/2";
                                        wn =
                                            "Cripple over 1/4 HP and causes No Sense of Smell/Taste (non-cutting) or Appearance loss (cutting, x2 crippling threshold), non-cutting major wound -5 to stun/knockdown.";
                                        crittable = "Head";
                                        break;
                                    default:
                                        loc = "Nose";
                                        wm = "x4";
                                        wn =
                                            "Cripple over 1/4 HP and causes No Sense of Smell/Taste (non-cutting) or Appearance loss (cutting, x2 crippling threshold), non-cutting major wound -5 to stun/knockdown.";
                                        crittable = "Head";
                                }
                                break;
                            case 3:
                                switch (dtype) {
                                    case "cor":
                                        loc = "Ear";
                                        wm = "x1 1/2";
                                        wn =
                                            "Cripple over 1/4 HP, no -5 to stun/knockdown, major wound only on sever; lost ear causes Appearance penalties.";
                                        crittable = "Head";
                                        break;
                                    default:
                                        loc = "Ear";
                                        wm = "x4";
                                        wn =
                                            "Cripple over 1/4 HP, no -5 to stun/knockdown, major wound only on sever; lost ear causes Appearance penalties.";
                                        crittable = "Head";
                                }
                                break;
                            case 4:
                            case 5:
                                switch (dtype) {
                                    case "cor":
                                        loc = "Cheeks";
                                        wm = "x1 1/2";
                                        wn =
                                            "Any injury causing shock requires stun/knockdown roll, major wound roll -10 vs stun/knockdown; bleed at 30 seconds not 1 minute";
                                        crittable = "Head";
                                        break;
                                    default:
                                        loc = "Cheeks";
                                        wm = "x4";
                                        wn =
                                            "Any injury causing shock requires stun/knockdown roll, major wound roll -10 vs stun/knockdown; bleed at 30 seconds not 1 minute";
                                        crittable = "Head";
                                }
                                break;
                            case 6:
                                switch (dtype) {
                                    case "cor":
                                        loc = "Eye";
                                        wm = "x1 1/2";
                                        wn =
                                            "Cripple over 1/10 hp; otherwise skull hit w/no DR. Tox has no spec. effect beyond cripple; bleed at 30 seconds not 1 min.";
                                        crittable = "Head";
                                        break;
                                    case "tox":
                                        loc = "Eye";
                                        wm = "x1";
                                        wn =
                                            "Cripple over 1/10 hp; otherwise skull hit w/no DR. Tox has no spec. effect beyond cripple; bleed at 30 seconds not 1 min.";
                                        crittable = "Head";
                                        break;
                                    default:
                                        loc = "Eye";
                                        wm = "x4";
                                        wn =
                                            "Cripple over 1/10 hp; otherwise skull hit w/no DR. Tox has no spec. effect beyond cripple; bleed at 30 seconds not 1 min.";
                                        crittable = "Head";
                                }
                                break;
                        }
                        break;
                    case 6: // Leg (Right)
                    case 7:
                        switch (subtableroll) {
                            case 1:
                            case 2:
                            case 3:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Shin (Right)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Shin (Right)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Shin (Right)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 4:
                                switch (dtype) {
                                    case "cr":
                                        loc = "Knee (Right)";
                                        wm = "x1";
                                        wn =
                                            "As per limb but cripple over 1/3 HP; dismember as per limb, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    case "pi-":
                                        loc = "Leg (Right)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Leg (Right)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Leg (Right)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 5:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Thigh (Right)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Thigh (Right)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Thigh (Right)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 6:
                                // Limb Vein/Artery cut & pi+ x2 , imp & pi++ x2.5, pi- x1, pi & bu (tb) x1.5 only
                                switch (dtype) {
                                    case "pi-":
                                    case "butb":
                                        loc = "Thigh Right (Vein/artery)";
                                        wm = "x1";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "pi":
                                        loc = "Thigh Right (Vein/artery)";
                                        wm = "x1 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Thigh Right(Vein/artery)";
                                        wm = "x2 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Thigh Right (Vein/artery))";
                                        wm = "x2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cor":
                                    case "cr":
                                        loc = "Thigh (Right)";
                                        wm = "x2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Thigh (Right)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                        }
                        break;
                    case 8: // Arm (Right)
                        switch (subtableroll) {
                            case 1:
                            case 2:
                            case 3:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Forearm (Right)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Forearm (Right)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Forearm (Right)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 4:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Elbow (Right)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Elbow (Right)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cr":
                                        loc = "Elbow (Right)";
                                        wm = "x1 1/2";
                                        wn =
                                            "Miss by 1 hit limb; as per limb but cripple over 1/3 HP; dismember as per limb, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Elbow (Right)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 5:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Upper Arm (Right)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Upper Arm (Right)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Upper Arm (Right)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 6:
                                // Limb Vein/Artery cut & pi+ x2 , imp & pi++ x2.5, pi- x1, pi & bu (tb) x1.5 only
                                switch (dtype) {
                                    case "pi-":
                                    case "butb":
                                        loc = "Shoulder Right (Vein/Artery)";
                                        wm = "x1";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "pi":
                                    case "bu(tb)":
                                        loc = "Shoulder Right (Vein/Artery)";
                                        wm = "x1 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Shoulder Right (Vein/Artery)";
                                        wm = "x2 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Shoulder Right (Vein/Artery)";
                                        wm = "x2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Shoulder Right";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                        }
                        break;
                    case 9: // Chest
                    case 10:
                        switch (subtableroll) {
                            case 1: // Vitals cr, imp, pi, or tight-beam burning only
                                switch (dtype) {
                                    case "pi-":
                                    case "pi":
                                    case "pi+":
                                    case "pi++":
                                    case "imp":
                                        loc = "Vitals";
                                        wm = "x3";
                                        wn =
                                            "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty.";
                                        crittable = "Body";
                                        break;
                                    case "butb":
                                        loc = "Vitals";
                                        wm = "x2";
                                        wn =
                                            "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty.";
                                        crittable = "Body";
                                        break;
                                    case "cr":
                                        loc = "Vitals";
                                        wm = "x1";
                                        wn =
                                            "HT roll for Knockdown, if major wound -5 stun/knockdown roll;<br /> injury can't exceed 2xHP (1xHP if using bleeding);<br />any excess is lost -4 bleed penalty.<br />If from behind treat as Spine.";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Chest";
                                        wm = "x1 1/2";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Chest";
                                        wm = "x1";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                        crittable = "Body";
                                }
                                break;
                            case 7:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Spine";
                                        wm = "x1/2";
                                        wn = "Miss by 1 hit chest; 3 DR; as per chest (injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost) but enough injury for shock penalty (even with HPT) gives stun/knockdown, -5 if a major wound. Cripple over 1xHP Bad Back (Severe) and Lame (Paraplegic) until healed";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Spine";
                                        wm = "x1 1/2";
                                        wn = "Miss by 1 hit chest; 3 DR; as per chest (injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost) but enough injury for shock penalty (even with HPT) gives stun/knockdown, -5 if a major wound. Cripple over 1xHP Bad Back (Severe) and Lame (Paraplegic) until healed";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Spine";
                                        wm = "x2";
                                        wn = "Miss by 1 hit chest; 3 DR; as per chest (injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost) but enough injury for shock penalty (even with HPT) gives stun/knockdown, -5 if a major wound. Cripple over 1xHP Bad Back (Severe) and Lame (Paraplegic) until healed";
                                        crittable = "Body";
                                        break;
                                    case "pi":
                                    case "butb":
                                        loc = "Spine";
                                        wm = "x2";
                                        wn = "Miss by 1 hit chest; 3 DR; as per chest (injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost) but enough injury for shock penalty (even with HPT) gives stun/knockdown, -5 if a major wound. Cripple over 1xHP Bad Back (Severe) and Lame (Paraplegic) until healed";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Spine";
                                        wm = "x1";
                                        wn = "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                        crittable = "Body";
                                }
                                break;
                            case 8:
                                switch (dtype) {
                                    case "pi-":
                                    case "pi":
                                    case "pi+":
                                    case "pi++":
                                    case "imp":
                                        loc = "Heart";
                                        wm = "x3";
                                        wn =
                                            "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty. May be special for some characters (e.g. Vampires).";
                                        crittable = "Body";
                                        break;
                                    case "butb":
                                        loc = "Heart";
                                        wm = "x2";
                                        wn =
                                            "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty. May be special for some characters (e.g. Vampires).";
                                        crittable = "Body";
                                        break;
                                    case "cr":
                                        loc = "Heart";
                                        wm = "x1";
                                        wn =
                                            "HT roll for Knockdown, if major wound -5 stun/knockdown roll;<br /> injury can't exceed 2xHP (1xHP if using bleeding);<br />any excess is lost -4 bleed penalty.<br />If from behind treat as Spine. May be special for some characters (e.g. Vampires). ";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Chest";
                                        wm = "x1 1/2";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost.";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Chest";
                                        wm = "x1";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost.";
                                        crittable = "Body";
                                }
                                break;
                            default:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Chest";
                                        wm = "x1/2";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Chest";
                                        wm = "x1 1/2";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Chest";
                                        wm = "x2";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Chest";
                                        wm = "x1";
                                        wn =
                                            "injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost";
                                        crittable = "Body";
                                }
                        }
                        break;
                    case 11: // Abdomen Subtable locations pg 4. LOADOUTS: LOW-TECH ARMOR
                        switch (subtableroll) {
                            case 1:
                                switch (dtype) {
                                    case "cr":
                                    case "cor":
                                    case "burn":
                                    case "fat":
                                    case "tox":
                                    case "spcl":
                                        loc = "Vitals";
                                        wm = "x1";
                                        wn =
                                            "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty.";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Vitals";
                                        wm = "x1 1/2";
                                        wn =
                                            "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty. If from behind treart as Spine.";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Vitals";
                                        wm = "x3";
                                        wn =
                                            "HT roll for Knockdown, major wound -5 stun/knockdown; bleed at 30 seconds not 1 minute; -4 bleed penalty";
                                        crittable = "Body";
                                }
                                break;
                            case 2:
                            case 3:
                            case 4:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Digestive Tract";
                                        wm = "x1/2";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound HT-3 to avoid special";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Digestive Tract";
                                        wm = "x1 1/2";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound HT-3 to avoid special";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Digestive Tract";
                                        wm = "x2";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound HT-3 to avoid special";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Digestive Tract";
                                        wm = "x1";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound HT-3 to avoid special";
                                        crittable = "Body";
                                }
                                break;
                            case 5:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Pelvis";
                                        wm = "x1/2";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound: fall down, cannot stand, Lame (Missing Legs) until healed";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Pelvis";
                                        wm = "x1 1/2";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound: fall down, cannot stand, Lame (Missing Legs) until healed";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Pelvis";
                                        wm = "x2";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound: fall down, cannot stand, Lame (Missing Legs) until healed";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Pelvis";
                                        wm = "x1";
                                        wn =
                                            "Injury can't exceed 2xHP (1xHP if using bleeding); any excess is lost; on major wound: fall down, cannot stand, Lame (Missing Legs) until healed";
                                        crittable = "Body";
                                }
                                break;
                            case 6:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Groin";
                                        wm = "x1/2";
                                        wn = "double shock; major wound -5 stun/knockdown";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Groin";
                                        wm = "x1 1/2";
                                        wn = "double shock; major wound -5 stun/knockdown";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Groin";
                                        wm = "x2";
                                        wn = "double shock; major wound -5 stun/knockdown";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Groin";
                                        wm = "x1";
                                        wn = "double shock; major wound -5 stun/knockdown";
                                        crittable = "Body";
                                }
                                break;
                        }
                        break;
                    case 12: // Left Arm
                        switch (subtableroll) {
                            case 1:
                            case 2:
                            case 3:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Forearm (Left)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Forearm (Left)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Forearm (Left)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 4:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Elbow (Left)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Elbow (Left)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cr":
                                        loc = "Elbow (Left)";
                                        wm = "x1 1/2";
                                        wn =
                                            "Miss by 1 hit limb; as per limb but cripple over 1/3 HP; dismember as per limb, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Elbow (Left)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 5:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Upper Arm (Left)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Upper Arm (Left)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Upper Arm (Left)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 6:
                                // Limb Vein/Artery cut & pi+ x2 , imp & pi++ x2.5, pi- x1, pi & bu (tb) x1.5 only
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Shoulder Left (Vein/Artery)";
                                        wm = "x1";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "pi":
                                    case "butb":
                                        loc = "Shoulder Left (Vein/Artery)";
                                        wm = "x1 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Shoulder Left (Vein/Artery)";
                                        wm = "x2 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Shoulder Left (Vein/Artery)";
                                        wm = "x2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Shoulder Left";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                        }
                        break;
                    case 13: // Leg (Left)
                    case 14:
                        switch (subtableroll) {
                            case 1:
                            case 2:
                            case 3:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Shin (Left)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Shin (Left)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Shin (Left)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 4:
                                switch (dtype) {
                                    case "cr":
                                        loc = "Knee (Left)";
                                        wm = "x1";
                                        wn =
                                            "As per limb but cripple over 1/3 HP; dismember as per limb, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    case "pi-":
                                        loc = "Leg (Left)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Leg (Left)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Leg (Left)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 5:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Thigh (Left)";
                                        wm = "x1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Thigh (Left)";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default: // burn, cor, cr, fat, pi, pi+, pi++, imp and toxic (tox): x1
                                        loc = "Thigh (Left)";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                            case 6:
                                // Limb Vein/Artery cut & pi+ x2 , imp & pi++ x2.5, pi- x1, pi & bu (tb) x1.5 only
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Thigh Left (Vein/artery)";
                                        wm = "x1";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "pi":
                                        loc = "Thigh Left (Vein/artery)";
                                        wm = "x1 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "imp":
                                    case "pi++":
                                        loc = "Thigh Left(Vein/artery)";
                                        wm = "x2 1/2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "pi+":
                                        loc = "Thigh Left (Vein/artery)";
                                        wm = "x2";
                                        wn =
                                            "no cripple, no inj limit; bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cor":
                                    case "cr":
                                        loc = "Thigh Left";
                                        wm = "x2";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Thigh Left";
                                        wm = "x1";
                                        wn = "cripple over 1/2 HP";
                                        crittable = "Body";
                                }
                                break;
                        }
                        break;
                    case 15: // Hand Extremity
                        switch (subtableroll) {
                            case 1:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Hand Joint";
                                        wm = "x1/2";
                                        wn =
                                            "Miss by 1 hit extremity; as per extremity but cripple over 1/4 HP; dismember as per extremity, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Hand Joint";
                                        wm = "x1 1/2";
                                        wn =
                                            "Miss by 1 hit extremity; as per extremity but cripple over 1/4 HP; dismember as per extremity, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Hand Extremity";
                                        wm = "x1";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                }
                                break;
                            default:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Hand Extremity";
                                        wm = "x1/2";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Hand Extremity";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Hand Extremity";
                                        wm = "x1";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                }
                        }
                        break;
                    case 16: // Foot Extremity
                        switch (subtableroll) {
                            case 1:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Foot Joint";
                                        wm = "x1/2";
                                        wn =
                                            "Miss by 1 hit extremity; as per extremity but cripple over 1/4 HP; dismember as per extremity, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Foot Joint";
                                        wm = "x1 1/2";
                                        wn =
                                            "Miss by 1 hit extremity; as per extremity but cripple over 1/4 HP; dismember as per extremity, not per joint; recover from cripple at -2";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Foot Extremity";
                                        wm = "x1";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                }
                                break;
                            default:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Foot Extremity";
                                        wm = "x1/2";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Foot Extremity";
                                        wm = "x1 1/2";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Foot Extremity";
                                        wm = "x1";
                                        wn = "cripple over 1/3 HP";
                                        crittable = "Body";
                                }
                        }
                        break;
                    case 17: // Neck
                    case 18:
                        switch (subtableroll) {
                            case 1:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Neck Vein/Artery";
                                        wm = "x1/2";
                                        wn =
                                            "Bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cr":
                                        loc = "Neck Windpipe";
                                        wm = "x2";
                                        wn =
                                            "Injury over HP/2 to the neck hit location as a crippling injury which crushes the windpipe, causing choking.";
                                        crittable = "Body";
                                        break;
                                    case "cor":
                                    case "imp":
                                    case "pi++":
                                        loc = "Neck Vein/Artery";
                                        wm = "x2";
                                        wn =
                                            "Bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                        loc = "Neck Vein/Artery";
                                        wm = "x2 1/2";
                                        wn =
                                            "Bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    case "pi+":
                                    case "butb":
                                        loc = "Neck Vein/Artery";
                                        wm = "x1 1/2";
                                        wn =
                                            "Bleed at -3 (-4 if cu); make bleed rolls every 30s";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Neck Vein/Artery";
                                        wm = "x1";
                                        wn =
                                            "Bleed at 30 seconds not 1 minute; -2 bleed penalty.";
                                        crittable = "Body";
                                }
                                break;
                            default:
                                switch (dtype) {
                                    case "pi-":
                                        loc = "Neck";
                                        wm = "x1/2";
                                        wn =
                                            "Bleed at 30 seconds not 1 minute; -2 bleed penalty.";
                                        crittable = "Body";
                                        break;
                                    case "cut":
                                    case "imp":
                                    case "pi++":
                                        loc = "Neck";
                                        wm = "x2";
                                        wn =
                                            "Bleed at 30 seconds not 1 minute; -2 bleed penalty.";
                                        crittable = "Body";
                                        break;
                                    case "cor":
                                    case "pi":
                                        loc = "Neck";
                                        wm = "x1 1/2";
                                        wn =
                                            "Bleed at 30 seconds not 1 minute; -2 bleed penalty.";
                                        crittable = "Body";
                                        break;
                                    case "cr":
                                        loc = "Neck";
                                        wm = "x1 1/2";
                                        wn =
                                            "Injury over HP/2 to the neck hit location as a crippling injury which crushes the windpipe, causing choking. Treat as spine if from rear";
                                        crittable = "Body";
                                        break;
                                    default:
                                        loc = "Neck";
                                        wm = "x1";
                                        wn =
                                            "Bleed at 30 seconds not 1 minute; -2 bleed penalty.";
                                        crittable = "Body";
                                }
                        }
                        break;
					case 40:
				switch (subtable) {
					case 1: // ===== Homogenous Wounding Modifiers
						switch (dtype) {
							case "imp":
							case "pi++":
								loc = "Weapon";
								wm = "x1/2";
								wn = "";
								crittable = "Body";
								break;
							case "pi+":
								loc = "Weapon";
								wm = "x1/3";
								wn = "";
								crittable = "Body";
								break;
							case "pi":
								loc = "Weapon";
								wm = "x1/5";
								wn = "";
								crittable = "Body";
								break;
							case "pi-":
								loc = "Weapon";
								wm = "x1/10";
								wn = "";
								crittable = "Body";
								break;
							default:
								loc = "Weapon";
								wm = "x1";
								wn = "";
								crittable = "Body";
								break;
						}
				}
        }

                if (whisper === "public") {
                    sendChat(msg.who, `&{template:GURPSDAMAGE} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
                } else if (whisper === "secret") {
                    sendChat(msg.who, `/w gm &{template:GURPSDAMAGEGM} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
                    sendChat(msg.who, `/w ` + who + `&{template:GURPSDAMAGE} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
                } else if (whisper === "gm") {
                    sendChat(msg.who, `/w gm &{template:GURPSDAMAGEGM} {{damage=[[${dam}]]}} {{type=${dtype}}} {{location=${loc}}} {{wm=${wm}}} {{wound_notes=${wn}}}`);
                }
            }
        } else if (roll === 18) {
            fail = "Critical Miss";
            success = "";
        } else if (roll === 17 && level <= 15) {
            fail = "Critical Miss";
            success = "";
        } else if (roll > level && margin >= 10) {
            fail = "Critical Miss";
            success = "";
        } else if (roll === 17 && margin < 10) {
            fail = "Failure by a margin of: " + margin;
            success = "";
        } else if (roll > level) {
            fail = "Miss by a margin of: " + margin;
            success = "";
        }
        // Send Template to Chat	
        log(msg.content);

        if (whisper === "public") {
            sendChat(msg.who,
                `&{template:GURPSATTACK} {{charactername=${name}}} {{roll_name=@{${name}|${rangedBuilder(rowid,'weaponname')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success.toString()}}} {{fail=${fail.toString()}}} {{notes=${notes.toString()}}} {{usage=${usage.toString()}}} `);

        } else if (whisper === "secret") {
            sendChat(msg.who, `/w gm &{template:GURPSATTACKGM} {{charactername=${name}}} {{roll_name=@{${name}|${rangedBuilder(rowid,'weaponname')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success.toString()}}} {{fail=${fail.toString()}}} {{notes=${notes.toString()}}} {{usage=${usage.toString()}}} `);

            sendChat(msg.who, `/w ` + who +
                `&{template:GURPSATTACK} {{charactername=${name}}} {{roll_name=@{${name}|${rangedBuilder(rowid,'weaponname')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success.toString()}}} {{fail=${fail.toString()}}} {{notes=${notes.toString()}}} {{usage=${usage.toString()}}} `);
        } else if (whisper === "gm") {
            sendChat(msg.who, `/w gm &{template:GURPSATTACKGM} {{charactername=${name}}} {{roll_name=@{${name}|${rangedBuilder(rowid,'weaponname')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success.toString()}}} {{fail=${fail.toString()}}} {{notes=${notes.toString()}}} {{usage=${usage.toString()}}} `);
			sendChat(msg.who, `&{template:GURPSGMROLLING} {{gmrolling=${gmrolling}}}`);
        }
    }
});

// Spells
const spellBuilder = (rowid, cell) => `repeating_spells_${rowid}_${cell}`;
on("chat:message", function(msg) {

    if (msg.type === "api" && /^!spell/.test(msg.content)) {
        // Variables from sheet
        var who = getObj('player', msg.playerid).get('_displayname')
            .split(' ')[0];
        let cmd = processInlinerolls(msg).split(/\s+/);
        var character = getObj('character', cmd[1]); // get character id
        let rowid = cmd[2]; // Get Row Id
        var name = getAttrByName(character.id, 'character_name');
        var whisper = getAttrByName(character.id, 'whispermode');
        var level = Number(cmd[3]); // target
        var notesOnOff = Number(cmd[4]); // Notes on/off
        var note = getAttrByName(character.id, spellBuilder(rowid, 'notes'));
        var clss = getAttrByName(character.id, spellBuilder(rowid, 'class'));
        var college = getAttrByName(character.id, spellBuilder(rowid, 'college'));
        var casttime = getAttrByName(character.id, spellBuilder(rowid, 'casttime'));
        var duration = getAttrByName(character.id, spellBuilder(rowid, 'duration'));
        var cost = getAttrByName(character.id, spellBuilder(rowid, 'cost'));
        var maintain = getAttrByName(character.id, spellBuilder(rowid, 'maintain'));
		var gmrolling = who + " GM rolling dice!";
        // Variables from API
        var roll = Number(randomInteger(6) + randomInteger(6) + randomInteger(6));
        var margin = Math.abs(level - roll);
        var success;
        var fail;
        // Start building template output
        if (notesOnOff === 1) {
            notes = note;
        } else {
            notes = "";
        }

        // ========== Roll Logic ==========
        if (roll === 3 || roll === 4) {
            success = "Critical Success";
            fail = "";
        } else if (roll === 5 && level >= 15) {
            success = "Critical Success";
            fail = "";
        } else if (roll === 6 && level >= 16) {
            success = "Critical Success";
            fail = "";
        } else if (roll < 17 && roll <= level) {
            success = "Success by a margin of: " + margin;
            fail = "";
        } else if (roll === 17 || roll === 18) {
            fail = "Critical Failure";
            success = "";
        } else if (roll === 17 && level <= 15) {
            fail = "Critical Failure";
            success = "";
        } else if (roll > level && margin >= 10) {
            fail = "Critical Failure";
            success = "";
        } else if (roll === 17 && margin < 10) {
            fail = "Failure by a margin of: " + margin;
            success = "";
        } else if (roll > level) {
            fail = "Failure by a margin of: " + margin;
            success = "";
        }
        //Log Message Contents
        log(msg.content);
        // Send Template to Chat	
        if (whisper === "public") {
            // Send to Public
            sendChat(msg.who,
                `&{template:GURPSMAGIC} {{charactername=${name}}} {{roll_name=@{${name}|${spellBuilder(rowid,'name')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}} {{casttime=${casttime.toString()}}} {{duration=${duration.toString()}}} {{cost=${cost.toString()}}} {{maintain=${maintain.toString()}}} {{clss=${clss.toString()}}} {{college=${college.toString()}}}`);
        } else if (whisper === "secret") {
            // Send to GM
            sendChat(msg.who, `/w gm &{template:GURPSMAGICGM} {{charactername=${name}}} {{roll_name=@{${name}|${spellBuilder(rowid,'name')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}} {{casttime=${casttime.toString()}}} {{duration=${duration.toString()}}} {{cost=${cost.toString()}}} {{maintain=${maintain.toString()}}} {{clss=${clss.toString()}}} {{college=${college.toString()}}}`);
            // Send to Player             
            sendChat(msg.who, `/w ` + who +
                `&{template:GURPSMAGIC} {{charactername=${name}}} {{roll_name=@{${name}|${spellBuilder(rowid,'name')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}} {{casttime=${casttime.toString()}}} {{duration=${duration.toString()}}} {{cost=${cost.toString()}}} {{maintain=${maintain.toString()}}} {{clss=${clss.toString()}}} {{college=${college.toString()}}}`);
        } else if (whisper === "gm") {
            // Send to GM
            sendChat(msg.who, `/w gm &{template:GURPSMAGICGM} {{charactername=${name}}} {{roll_name=@{${name}|${spellBuilder(rowid,'name')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}} {{casttime=${casttime.toString()}}} {{duration=${duration.toString()}}} {{cost=${cost.toString()}}} {{maintain=${maintain.toString()}}} {{clss=${clss.toString()}}} {{college=${college.toString()}}}`);
            // Send to Public    
            sendChat(msg.who, `&{template:GURPSGMROLLING} {{gmrolling=${gmrolling}}}`);
        }
    }
});

// Rituals
const ritualBuilder = (rowid, cell) => `repeating_rituals_${rowid}_${cell}`;
on("chat:message", function(msg) {

    if (msg.type === "api" && /^!ritual/.test(msg.content)) {
        // Variables from sheet
        var who = getObj('player', msg.playerid).get('_displayname')
            .split(' ')[0];
        let cmd = processInlinerolls(msg).split(/\s+/);
        var character = getObj('character', cmd[1]); // get character id
        let rowid = cmd[2]; // Get Row Id
        var name = getAttrByName(character.id, 'character_name');
        var whisper = getAttrByName(character.id, 'whispermode');
        var level = Number(cmd[3]); // target
        var effectsOnOff = Number(cmd[4]); // Effects on/off
        var inherentOnOff = Number(cmd[5]); // Inherent Modifiers on/off
        var greaterOnOff = Number(cmd[6]); // Greater Effects on/off
        var descriptionOnOff = Number(cmd[7]); // Ritual Description on/off
        var castingOnOff = Number(cmd[8]); // Typical Casting on/off
        var notesOnOff = Number(cmd[9]); // Notes on/off
        var effect = getAttrByName(character.id, ritualBuilder(rowid, 'spelleffects'));
        var inherent = getAttrByName(character.id, ritualBuilder(rowid, 'inherentmod'));
        var greater = getAttrByName(character.id, ritualBuilder(rowid, 'greatereffects'));
        var description = getAttrByName(character.id, ritualBuilder(rowid, 'ritualdescr'));
        var casting = getAttrByName(character.id, ritualBuilder(rowid, 'ritualcasting'));
        var note = getAttrByName(character.id, ritualBuilder(rowid, 'notes'));
		var gmrolling = who + " GM rolling dice!";
        // Variables from API
        var roll = Number(randomInteger(6) + randomInteger(6) + randomInteger(6));
        var margin = Math.abs(level - roll);
        var success;
        var fail;
        // Start building template output
        if (effectsOnOff === 1) {
            effects = effect;
        } else {
            effects = "";
        }
        if (inherentOnOff === 1) {
            inherentmod = inherent;
        } else {
            inherentmod = "";
        }
        if (greaterOnOff === 1) {
            great = greater;
        } else {
            great = "";
        }
        if (descriptionOnOff === 1) {
            descr = description;
        } else {
            descr = "";
        }
        if (castingOnOff === 1) {
            typical = casting;
        } else {
            typical = "";
        }
        if (notesOnOff === 1) {
            notes = note;
        } else {
            notes = "";
        }

        // ========== Roll Logic ==========
        if (roll === 3 || roll === 4) {
            success = "Critical Success";
            fail = "";
        } else if (roll === 5 && level >= 15) {
            success = "Critical Success";
            fail = "";
        } else if (roll === 6 && level >= 16) {
            success = "Critical Success";
            fail = "";
        } else if (roll < 17 && roll <= level) {
            success = "Success by a margin of: " + margin;
            fail = "";
        } else if (roll === 17 || roll === 18) {
            fail = "Critical Failure";
            success = "";
        } else if (roll === 17 && level <= 15) {
            fail = "Critical Failure";
            success = "";
        } else if (roll > level && margin >= 10) {
            fail = "Critical Failure";
            success = "";
        } else if (roll === 17 && margin < 10) {
            fail = "Failure by a margin of: " + margin;
            success = "";
        } else if (roll > level) {
            fail = "Failure by a margin of: " + margin;
            success = "";
        }
        //Log Message Contents
        log(msg.content);
        // Send Template to Chat	
        if (whisper === "public") {
            // Send to Public
            sendChat(msg.who,
                `&{template:GURPSRITUAL} {{charactername=${name}}} {{roll_name=@{${name}|${ritualBuilder(rowid,'ritualname')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}} {{effects=${effects.toString()}}} {{inherentmod=${inherentmod.toString()}}} {{descr=${descr.toString()}}} {{typical=${typical.toString()}}}`);
        } else if (whisper === "secret") {
            // Send to GM
            sendChat(msg.who, `/w gm &{template:GURPSRITUALGM} {{charactername=${name}}} {{roll_name=@{${name}|${ritualBuilder(rowid,'ritualname')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}} {{effects=${effects.toString()}}} {{inherentmod=${inherentmod.toString()}}} {{descr=${descr.toString()}}} {{typical=${typical.toString()}}}`);
            // Send to Player             
            sendChat(msg.who, `/w ` + who +
                `&{template:GURPSRITUAL} {{charactername=${name}}} {{roll_name=@{${name}|${ritualBuilder(rowid,'ritualname')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}} {{effects=${effects.toString()}}} {{inherentmod=${inherentmod.toString()}}} {{descr=${descr.toString()}}} {{typical=${typical.toString()}}}`);
        } else if (whisper === "gm") {
            // Send to GM
            sendChat(msg.who, `/w gm &{template:GURPSRITUALGM} {{charactername=${name}}} {{roll_name=@{${name}|${ritualBuilder(rowid,'ritualname')}}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success}}} {{fail=${fail}}}  {{notes=${notes.toString()}}} {{effects=${effects.toString()}}} {{inherentmod=${inherentmod.toString()}}} {{descr=${descr.toString()}}} {{typical=${typical.toString()}}}`);
            // Send to Public    
            sendChat(msg.who, `&{template:GURPSGMROLLING} {{gmrolling=${gmrolling}}}`);
        }
    }
});

on("chat:message", function(msg) {
    if (msg.type === "api" && /^!fear/.test(msg.content)) {
        let cmd = processInlinerolls(msg).split(/\s+/);
		var who = getObj('player', msg.playerid).get('_displayname')
            .split(' ')[0];
        var character = getObj('character', cmd[1]);
        var table = (cmd[2]);
        var name = getAttrByName(character.id,
            'character_name');
        var whisper = getAttrByName(character.id,
            'whispermode');
        var raw = Number(cmd[3]);
		var thresh = Number(cmd[4]);
        var level = Math.min(Math.max(raw, -99), thresh)
        var roll = Number(randomInteger(6) + randomInteger(6) + randomInteger(6));
        var margin = Number(Math.abs(level - roll));
		var gmrolling = who + " GM rolling dice!";		
        var result;
        var tableroll = Number(randomInteger(6) +
            randomInteger(6) + randomInteger(6) + margin);
        var effect;
        var success;
        var fail;
        var fear;
        var awe;
        var confusion;
        // Start building template output

        // ========== Roll Logic ==========
        if (roll === 3 || roll === 4) {
            success = "Critical Success";
            fail = "";
            result = "Success";
        } else if (roll === 5 && level >= 15) {
            success = "Critical Success";
            fail = "";
            result = "Success";
        } else if (roll === 6 && level >= 16) {
            success = "Critical Success";
            fail = "";
            result = "Success";
        } else if (roll < 17 && roll <= level) {
            success = "Success by a margin of: " + margin;
            fail = "";
            result = "Success";
        }
        // A roll of 18 is always a critical failure.
        else if (roll === 18) {
            fail = "Critical Failure";
            success = "";
            result = "Failure";
        }
        // A roll of 17 is a critical failure if your effective skill is 15 or less; otherwise, it is an ordinary failure.
        else if (roll === 17 && level <= 15) {
            fail = "Critical Failure";
            success = "";
            result = "Failure";
        }
        // Any roll of 10 greater than your effective skill is a critical failure
        else if (roll > level && margin >= 10) {
            fail = "Critical Failure";
            success = "";
            result = "Failure";
        } else if (roll === 17 && margin < 10) {
            fail = "Failure by a margin of: " + margin;
            success = "";
        } else if (roll > level) {
            fail = "Failure by a margin of: " + margin;
            success = "";
            result = "Failure";
        }

        switch (result) {
            case "Failure":
            case "Critical Failure":
                switch (table) {
                    case "Fear":
                        switch (tableroll) {
                            case 4:
                            case 5:
                                effect =
                                    "Stunned for one second, then recover automatically.";
                                break;
                            case 6:
                            case 7:
                                effect =
                                    "Stunned for one second. Every second after that, roll vs. unmodified Will to snap out of it.";
                                break;
                            case 8:
                            case 9:
                                effect =
                                    "Stunned for one second. Every second after that, roll vs. Will, plus whatever bonuses or penalties you had on your original roll, to snap out of it.";
                                break;
                            case 10:
                                effect =
                                    "Stunned for [[1d6]] seconds. Every second after that, roll vs. modified Will, plus whatever bonuses or penalties you had on your original roll, to snap out of it.";
                                break;
                            case 11:
                                effect =
                                    "Stunned for [[2d6]] seconds. Every second after that, roll vs. modified Will, plus whatever bonuses or penalties you had on your original roll, to snap out of it.";
                                break;
                            case 12:
                                effect =
                                    "Incapacitated: Retching for (25 - HT) seconds, and then roll vs. HT each second to recover.";
                                break;
                            case 13:
                                effect =
                                    "Acquire a new mental quirk that are mild phobias. (see Quirks, p. 162). This is the only way to acquire more than five quirks.";
                                break;
                            case 14:
                            case 15:
                                effect =
                                    "Lose [[1d6]] FP, and take [[1d6]] seconds of stunning. Every second after that, roll vs. modified Will, plus whatever bonuses or penalties you had on your original roll, to snap out of it.";
                                break;
                            case 17:
                                effect =
                                    "Fall down, incapacitated: Unconscious (faint) for [[1d6]] minutes, then roll vs. HT each minute to recover.";
                                break;
                            case 18:
                                effect =
                                    "Fall down, incapacitated: Unconscious (faint) for [[1d6]] minutes, then roll vs. HT each minute to recover. But also roll vs. HT immediately. On a failed roll, take 1 HP of injury as you collapse.";
                                break;
                            case 19:
                                effect =
                                    "Fall down, incapacitated: Unconscious (faint) for [[2d6]] minutes, then roll vs. HT each minute to recover. Immediately take 1 HP of injury as you collapse.";
                                break;
                            case 20:
                                effect =
                                    "Fall down, incapacitated: Unconscious (faint) for [[4d6]] minutes, then roll vs. HT each minute to recover. Immediately take 1 HP of injury as you collapse. Also, lose [[1d6]] FP.";
                                break;
                            case 21:
                                effect =
                                    "Feeble-minded activity: Fright causes panic. You run around screaming, sit down and cry, or do something equally pointless for [[1d6]] minutes. After duration, roll vs. unmodified Will once per minute to snap out of it.";
                                break;
                            case 22:
                                effect =
                                    "Acquire a -10-point Delusion (p. 130).";
                                break;
                            case 23:
                                effect =
                                    "Acquire a -10-point Phobia (p. 148) or other -10-point mental disadvantage.";
                                break;
                            case 24:
                                effect =
                                    "Major physical effect, set by GM: hair turns white, age five years overnight, go partially deaf, etc. In game terms, acquire -15 points worth of physical disadvantages (for this purpose, each year of age counts as -3 points).";
                                break;
                            case 25:
                                effect =
                                    "If you already have a Phobia or other mental disadvantage that is logically related to the frightening incident, your self-control number becomes one step worse. If not, or if your selfcontrol number is already 6, add a new -10- point Phobia or other -10-point mental disadvantage.";
                                break;
                            case 26:
                                effect =
                                    "Faint for [[1d6]] minutes, then roll vs. HT each minute to recover. and roll vs. HT immediately. On a failed roll, take 1 HP of injury as you collapse, Acquire a -10-point Delusion (p. 130).";
                                break;
                            case 27:
                                effect =
                                    "Faint for [[1d6]] minutes, then roll vs. HT each minute to recover. and roll vs. HT immediately. On a failed roll, take 1 HP of injury as you collapse. Acquire a -10-point Phobia (p. 148) or other -10-point mental disadvantage.";
                                break;
                            case 28:
                                effect =
                                    "Light coma. You fall unconscious, rolling vs. HT every 30 minutes to recover. For 6 hours after you come to, all skill rolls and attribute checks are at -2.";
                                break;
                            case 29:
                                effect =
                                    "Coma. You are unconscious for [[1d6]] hours, rolling vs. HT every 30 minutes to recover.. Then roll vs. HT. If the roll fails, remain in a coma for another [[1d6]] hours, and so on. After you come to, all skill rolls and attribute checks are at -2.";
                                break;
                            case 30:
                                effect =
                                    "Catatonia. Stare into space for [[1d6]] days. Then roll vs. HT. On a failed roll, remain catatonic for another [[1d6]] days, and so on. If you have no medical care, lose 1 HP the first day, 2 the second, and so on.  If you survive and awaken, all skill rolls and attribute checks are at -2 for as many days as the catatonia lasted.";
                                break;
                            case 31:
                                effect =
                                    "Seizure. You lose control of your body and fall to the ground in a fit lasting [[1d6]] minutes and costing [[1d6]] FP. Also, roll vs. HT. On a failure, take [[1d6]] of injury. On a critical failure, you also lose 1 HT permanently.";
                                break;
                            case 32:
                                effect =
                                    "Stricken. You fall to the ground, taking [[2d6]] of injury in the form of a mild heart attack or stroke.";
                                break;
                            case 33:
                                effect =
                                    "Total panic. You are out of control; you might do anything (the GM rolls 3d: the higher the roll, the more useless your reaction). For instance, you might jump off a cliff to avoid the monster. If you survive your first reaction, roll vs. Will to come out of the panic. If you fail, the GM rolls for another panic reaction, and so on!";
                                break;
                            case 34:
                                effect =
                                    "Acquire a -15-point Delusion (p. 130).";
                                break;
                            case 35:
                                effect =
                                    "Acquire a -15-point Phobia (p. 148) or other mental disadvantage worth -15 points.";
                                break;
                            case 36:
                                effect =
                                    "Severe physical effect, as per 24, --(Major physical effect, set by GM: hair turns white, age five years overnight, go partially deaf, etc. In game terms, acquire -15 points worth of physical disadvantages (for this purpose, each year of age counts as -3 points).)-- but equivalent to -20 points of physical disadvantages.";
                                break;
                            case 37:
                                effect =
                                    "Severe physical effect, as per 24, --(Major physical effect, set by GM: hair turns white, age five years overnight, go partially deaf, etc. In game terms, acquire -15 points worth of physical disadvantages (for this purpose, each year of age counts as -3 points).)-- but equivalent to -30 points of physical disadvantages.";
                                break;
                            case 38:
                                effect =
                                    "Coma. You are unconscious for [[1d6]] hours, rolling vs. HT every 30 minutes to recover.. Then roll vs. HT. If the roll fails, remain in a coma for another [[1d6]] hours, and so on. After you come to, all skill rolls and attribute checks are at -2. --  And Acquire a -15-point Delusion (p. 130).";
                                break;
                            case 39:
                                effect =
                                    "Coma. You are unconscious for [[1d6]] hours, rolling vs. HT every 30 minutes to recover.. Then roll vs. HT. If the roll fails, remain in a coma for another [[1d6]] hours, and so on. After you come to, all skill rolls and attribute checks are at -2. Acquire a -15-point Phobia (p. 148) or other mental disadvantage worth -15 points.";
                                break;
                            case 40:
                                effect =
                                    "Coma. You are unconscious for [[1d6]] hours, rolling vs. HT every 30 minutes to recover.. Then roll vs. HT. If the roll fails, remain in a coma for another [[1d6]] hours, and so on. After you come to, all skill rolls and attribute checks are at -2. and a -15-point Phobia or other -15-point mental disadvantage, but victim also loses 1 point of IQ permanently. This automatically reduces all IQ-based skills, including magic spells, by 1.";
                                break;
                        }
                        break;
                    case "Awe":
                        switch (tableroll) {
                            case 4:
                            case 5:
                                effect =
                                    "Stunned for one second, then recover automatically.";
                                break;
                            case 6:
                            case 7:
                                effect =
                                    "Stunned for one second. Every second after that, roll vs. unmodified Will to snap out of it.";
                                break;
                            case 8:
                            case 9:
                                effect =
                                    "Stunned for one second. Every second after that, roll vs. Will, plus whatever bonuses or penalties you had on your original roll, to snap out of it.";
                                break;
                            case 10:
                                effect =
                                    "Stunned for [[1d6]] seconds. Every second after that, roll vs. modified Will, plus whatever bonuses or penalties you had on your original roll, to snap out of it.";
                                break;
                            case 11:
                                effect =
                                    "Stunned for [[2d6]] seconds. Every second after that, roll vs. modified Will, plus whatever bonuses or penalties you had on your original roll, to snap out of it.";
                                break;
                            case 12:
                                effect =
                                    "Incapacitated: Ecstasy for (25 - Will) seconds, and then roll vs. Will each second to recover.";
                                break;
                            case 13:
                                effect =
                                    "Acquire a new mental quirks that reflect admiration. (see Quirks, p. 162). This is the only way to acquire more than five quirks.";
                                break;
                            case 14:
                            case 15:
                                effect =
                                    "Lose [[1d6]] FP, and take [[1d6]] seconds of stunning. Every second after that, roll vs. modified Will, plus whatever bonuses or penalties you had on your original roll, to snap out of it.";
                                break;
                            case 16:
                                effect =
                                    "Stunned for [[1d6]] seconds, Every second after that, roll vs. modified Will, plus whatever bonuses or penalties you had on your original roll, to snap out of it., and Acquire a new mental quirk (see Quirks, p. 162). This is the only way to acquire more than five quirks.";
                                break;
                            case 17:
                                effect =
                                    "Fall down, incapacitated: Ecstasy for [[1d6]] minutes, then roll vs. Will each minute to recover.";
                                break;
                            case 18:
                                effect =
                                    "Fall down, incapacitated: Ecstasy for [[1d6]] minutes, then roll vs. Will each minute to recover. But also roll vs. HT immediately. On a failure, take 1 HP of injury as you collapse.";
                                break;
                            case 19:
                                effect =
                                    "Fall down, incapacitated: Ecstasy for [[2d6]] minutes, then roll vs. Will each minute to recover. Immediately take 1 HP of injury as you collapse.";
                                break;
                            case 20:
                                effect =
                                    "Fall down, incapacitated: Ecstasy for [[4d6]] minutes, then roll vs. Will each minute to recover. Immediately take 1 HP of injury as you collapse. Also, lose [[1d6]] FP.";
                                break;
                            case 21:
                                effect =
                                    "Awe causes you to worship at the feet of the one who awed you – you must obey his every command as if you had Slave Mentality! Effect lasts [[3d6]] minutes. After duration, roll vs. unmodified Will once per minute to snap out of it.";
                                break;
                            case 22:
                            case 23:
                                awe =
                                    "Acquire a -10-point Delusion (p. 130). Awe impels you to adopt one of your new idol's self-imposed mental disadvantages, turns you into a slave (Reprogrammable) or makes you feel inferior (Low Self-Image).";
                                break;
                            case 24:
                                awe =
                                    "Major physical effect, set by GM: hair turns white, age five years overnight, go partially deaf, etc. In game terms, acquire -15 points worth of physical disadvantages (for this purpose, each year of age counts as -3 points).";
                                break;
                            case 25:
                                awe =
                                    "If you already have a -5 to -10-point disadvantage that could logically result from this encounter, it worsens to a -15-point trait!";
                                break;
                            case 26:
                            case 27:
                                awe =
                                    "Faint for [[1d6]] minutes, then roll vs. HT each minute to recover. and roll vs. HT immediately. On a failed roll, take 1 HP of injury as you collapse. Acquire a -10-point Delusion (p. 130). Awe impels you to adopt one of your new idol's self-imposed mental disadvantages, turns you into a slave (Reprogrammable) or makes you feel inferior (Low Self-Image).";
                                break;
                            case 28:
                                awe =
                                    "Light coma. You fall unconscious, rolling vs. HT every 30 minutes to recover. For 6 hours after you come to, all skill rolls and attribute checks are at -2.";
                                break;
                            case 29:
                                awe =
                                    "Coma, but you are unconscious for [[1d6]] hours. Then roll vs. HT. If the roll fails, remain in a coma for another [[1d6]] hours, and so on. After you come to, all skill rolls and attribute checks are at -2.";
                                break;
                            case 30:
                                awe =
                                    "Catatonia. Stare into space for [[1d6]] days. Then roll vs. HT. On a failed roll, remain catatonic for another [[1d6]] days, and so on. If you have no medical care, lose 1 HP the first day, 2 the second, and so on.  If you survive and awaken, all skill rolls and attribute checks are at -2 for as many days as the catatonia lasted.";
                                break;
                            case 31:
                                awe =
                                    "Seizure. You lose control of your body and fall to the ground in a fit lasting [[1d6]] minutes and costing [[1d6]] FP. Also, roll vs. HT. On a failure, take [[1d6]] of injury. On a critical failure, you also lose 1 HT permanently.";
                                break;
                            case 32:
                                awe =
                                    "Stricken. You fall to the ground, taking [[2d6]] of injury in the form of a mild heart attack or stroke.";
                                break;
                            case 33:
                                awe =
                                    "You lose control of your actions, Awe overcomes you. For instance, you might debase yourself harmfully to show your devotion. The GM rolls 3d: the higher the roll, the more useless your reaction.";
                                break;
                            case 34:
                            case 35:
                                awe =
                                    "Acquire a -15-point Delusion (p. 130). Awe usually results in Fanaticism – either for the one who awed you or his cause.";
                                break;
                            case 36:
                                awe =
                                    "Severe physical effect, set by GM: hair turns white, age five years overnight, go partially deaf, etc. In game terms, acquire -20 points worth of physical disadvantages (for this purpose, each year of age counts as -3 points).";
                                break;
                            case 37:
                                awe =
                                    "Severe physical effect, set by GM: hair turns white, age five years overnight, go partially deaf, etc. In game terms, acquire -30 points worth of physical disadvantages (for this purpose, each year of age counts as -3 points).";
                                break;
                            case 38:
                                awe =
                                    "Coma, but you are unconscious for [[1d6]] hours. Then roll vs. HT. If the roll fails, remain in a coma for another [[1d6]] hours, and so on. After you come to, all skill rolls and attribute checks are at -2.<br />Acquire a -15-point Phobia (p. 148) or other mental disadvantage worth -15 points. Awe usually results in Fanaticism – either for the one who awed you or his cause.";
                                break;
                            case 39:
                                awe =
                                    "Coma, but you are unconscious for [[1d6]] hours. Then roll vs. HT. If the roll fails, remain in a coma for another [[1d6]] hours, and so on. After you come to, all skill rolls and attribute checks are at -2.<br />Severe physical effect, set by GM: hair turns white, age five years overnight, go partially deaf, etc. In game terms, acquire -15 points worth of physical disadvantages (for this purpose, each year of age counts as -3 points).";
                                break;
                            case 40:
                                awe =
                                    "Coma, but you are unconscious for [[1d6]] hours. Then roll vs. HT. If the roll fails, remain in a coma for another [[1d6]] hours, and so on. After you come to, all skill rolls and attribute checks are at -2.<br /> Severe physical effect, set by GM: hair turns white, age five years overnight, go partially deaf, etc. In game terms, acquire -15 points worth of physical disadvantages (for this purpose, each year of age counts as -3 points)<br />Awe: lose 1 point of Will. (These losses are permanent.)";
                                break;
                        }
                        break;
                    case "Confusion":
                        switch (tableroll) {
                            case 4:
                            case 5:
                                effect =
                                    "Stunned for one second, then recover automatically.";
                                break;
                            case 6:
                            case 7:
                                effect =
                                    "Stunned for one second. Every second after that, roll vs. unmodified Will to snap out of it.";
                                break;
                            case 8:
                            case 9:
                                effect =
                                    "Stunned for one second. Every second after that, roll vs. Will, plus whatever bonuses or penalties you had on your original roll, to snap out of it.";
                                break;
                            case 10:
                                effect =
                                    "Stunned for [[1d6]] seconds. Every second after that, roll vs. modified Will, plus whatever bonuses or penalties you had on your original roll, to snap out of it.";
                                break;
                            case 11:
                                effect =
                                    "Stunned for [[2d6]] seconds. Every second after that, roll vs. modified Will, plus whatever bonuses or penalties you had on your original roll, to snap out of it.";
                                break;
                            case 12:
                                effect =
                                    "Incapacitated,  Dazed for (25 - IQ) seconds, and then roll vs. Will each second to recover.";
                                break;
                            case 13:
                                effect =
                                    "Acquire a new mental quirk (see Quirks, p. B162). Confusion leads to quirks that suggest bafflement or perplexity. This is the only way to acquire more than five quirks.";
                                break;
                            case 14:
                            case 15:
                                effect =
                                    "Lose [[1d6]] FP, and take [[1d6]] seconds of stunning. Every second after that, roll vs. modified Will, plus whatever bonuses or penalties you had on your original roll, to snap out of it.";
                                break;
                            case 17:
                                effect =
                                    "Fall down, incapacitated: Hallucinating for [[1d6]] minutes, after duration, roll vs. Will each minute to recover.";
                                break;
                            case 18:
                                effect =
                                    "Fall down, incapacitated: Hallucinating for [[1d6]] minutes, but also roll vs. Will immediately. On a failed roll, take 1 HP of injury as you collapse.";
                                break;
                            case 19:
                                effect =
                                    "Fall down, incapacitated: Hallucinating for [[2d6]] minutes, after duration, roll vs. Will each minute to recover. Immediately take 1 HP of injury as you collapse.";
                                break;
                            case 20:
                                effect =
                                    "Fall down, incapacitated: Hallucinating for [[4d6]] minutes, after duration, roll vs. Will each minute to recover. Immediately take 1 HP of injury as you collapse. Also, lose [[1d6]] FP.";
                                break;
                            case 21:
                                effect =
                                    "Confusion causes you to hallucinate (the GM specifies the details, which should fit the situation); you can try to act, but you're out of touch with reality and at -5 to all success rolls. Effect lasts [[3d6]] minutes.";
                                break;
                            case 22:
                            case 23:
                                effect =
                                    "Acquire a -10-point Delusion (p. B130), Confusion “blows your mind”, most likely resulting in one of Confused (12), Delusion (Major), Indecisive (12) or Short Attention Span (12).";
                                break;
                            case 24:
                                effect =
                                    "Major physical effect, set by GM: hair turns white, age five years overnight, go partially deaf, etc. In game terms, acquire -15 points worth of physical disadvantages (for this purpose, each year of age counts as -3 points).";
                                break;
                            case 25:
                                effect =
                                    "If you already have a -5 to -10-point disadvantage that could logically result from this encounter, it worsens to a -15-point trait!";
                                break;
                            case 26:
                            case 27:
                                effect =
                                    "Fall down, incapacitated: Unconscious (faint) for [[1d6]] minutes, but also roll vs. HT immediately. On a failed roll, take 1 HP of injury as you collapse. Acquire a -10-point Delusion (p. B130), Phobia (p. B148), or other mental disadvantage.";
                                break;
                            case 28:
                                effect =
                                    "Light coma. You fall unconscious, rolling vs. HT every 30 minutes to recover. For 6 hours after you come to, all skill rolls and attribute checks are at -2.";
                                break;
                            case 29:
                                effect =
                                    "Coma. You are unconscious for [[1d6]] hours. Then roll vs. HT. If the roll fails, remain in a coma for another [[1d6]] hours, and so on. After you come to, all skill rolls and attribute checks are at -2.";
                                break;
                            case 30:
                                effect =
                                    "Catatonia. Stare into space for [[1d6]] days. Then roll vs. HT. On a failed roll, remain catatonic for another [[1d6]] days, and so on. If you have no medical care, lose 1 HP the first day, 2 the second, and so on. If you survive and awaken, all skill rolls and attribute checks are at -2 for as many days as the catatonia lasted.";
                                break;
                            case 31:
                                effect =
                                    "Seizure. You lose control of your body and fall to the ground in a fit lasting [[1d6]] minutes and costing [[1d6]] FP. Also, roll vs. HT. On a failure, take [[1d6]] of injury. On a critical failure, you also lose 1 HT permanently.";
                                break;
                            case 32:
                                effect =
                                    "Stricken. You fall to the ground, taking [[2d6]] of injury in the form of a mild heart attack or stroke.";
                                break;
                            case 33:
                                effect =
                                    "You lose control of your actions, as per specific effect below. The GM rolls 3d: the higher the roll, the more useless your reaction.<br />Confusion drives you completely mad. For instance, you might believe you can fly and leap to your doom.<br />If you survive your first reaction, roll vs. Will to recover. If you fail, the GM rolls for another uncontrolled reaction, and so on!";
                                break;
                            case 34:
                            case 35:
                                effect =
                                    "Acquire a -15-point Delusion (p. B130), Confusion tends to cause Confused (9), Delusion (Severe), Indecisive (9), On the Edge (12), or Short Attention Span (9).";
                                break;
                            case 36:
                                effect =
                                    "Severe physical effect, set by GM: hair turns white, age five years overnight, go partially deaf, etc. In game terms, acquire -20 points worth of physical disadvantages (for this purpose, each year of age counts as -3 points).";
                                break;
                            case 37:
                                effect =
                                    "Severe physical effect, set by GM: hair turns white, age five years overnight, go partially deaf, etc. In game terms, acquire -30 points worth of physical disadvantages (for this purpose, each year of age counts as -3 points).";
                                break;
                            case 38:
                                effect =
                                    "Coma. You are unconscious for [[1d6]] hours. Then roll vs. HT. If the roll fails, remain in a coma for another [[1d6]] hours, and so on. After you come to, all skill rolls and attribute checks are at -2. Acquire a -15-point Delusion (p. B130), Confusion tends to cause Confused (9), Delusion (Severe), Indecisive (9), On the Edge (12), or Short Attention Span (9).";
                                break;
                            case 39:
                                effect =
                                    "Coma. You are unconscious for [[1d6]] hours. Then roll vs. HT. If the roll fails, remain in a coma for another [[1d6]] hours, and so on. After you come to, all skill rolls and attribute checks are at -2. Severe physical effect, set by GM: hair turns white, age five years overnight, go partially deaf, etc. In game terms, acquire -20 points worth of physical disadvantages (for this purpose, each year of age counts as -3 points).";
                                break;
                            case 40:
                                effect =
                                    "Coma. You are unconscious for [[1d6]] hours. Then roll vs. HT. If the roll fails, remain in a coma for another [[1d6]] hours, and so on. After you come to, all skill rolls and attribute checks are at -2. Severe physical effect, set by GM: hair turns white, age five years overnight, go partially deaf, etc. In game terms, acquire -20 points worth of physical disadvantages (for this purpose, each year of age counts as -3 points). Lose 1 point of IQ permanently. This automatically reduces all IQ-based skills, including magic spells, by 1.";
                                break;
                        }
                        break;
                }
                break;
            default: // result === "Success" || "Critical Success"
                effect = "No Effects";
        }
        log(msg.content);
        sendChat(msg.who,
            `/w gm &{template:GURPSFRIGHTGM} {{charactername=${name}}} {{fright_table=${table}}} {{roll=${roll.toString()}}} {{target=${level.toString()}}} {{success=${success.toString()}}} {{fail=${fail.toString()}}} {{fright_result=${effect}}}`
        );
    }
});

// Gather Energy
on("chat:message", function(msg) {
    if (msg.type === "api" && /^!ge/.test(msg.content)) {
        let cmd = processInlinerolls(msg).split(/\s+/);
        var who = getObj('player', msg.playerid).get(
                '_displayname')
            .split(' ')[0];
        //var character = getObj('character', cmd[1]);
        //var name = getAttrByName(character.id, 'character_name');
        //var whisper = getAttrByName(character.id, 'whispermode');
        var level = Number(cmd[1]);
        var energy = Number(cmd[2]);
        var time = Number(cmd[3]);
        // Variables from API
        var roll;
        var margin;
        var d = 0;
        var e = 0;
        var t = 0;
        var i = 0;
        var q = 0;
        var result;
        var skill;
        // Send Template to Chat	
        log(msg.content);

        do {
            if (++d == 3) {
                level = level - 1;
                skill = "Skill dropped to " + level;
                d = 0;
            } else {
                skill = "";
            }
            // ========== Roll Logic ==========
            roll = Number(randomInteger(6) + randomInteger(6) + randomInteger(6));
            if (roll === 3 || roll === 4) {
                margin = Math.max(1, (level - roll));
                result = "";
                time = 1;
            } else if (roll === 5 && level >= 15) {
                margin = Math.max(1, (level - roll));
                result = "";
                time = 1;
            } else if (roll === 6 && level >= 16) {
                margin = Math.max(1, (level - roll));
                result = "";
                time = 1;
            } else if (roll < 17 && roll <= level) {
                margin = Math.max(1, (level - roll));
                result = "";
                time = time;
            }
            // A roll of 18 is always a critical failure.
            else if (roll === 18) {
                result = "Critical Failure";
                time = time;
                break;
            }
            // A roll of 17 is a critical failure if your effective skill is 15 or less; otherwise, it is an ordinary failure.
            else if (roll === 17 && level <= 15) {
                result = "Critical Failure";
                time = time;
                break;
            }
            // Any roll of 10 greater than your effective skill is a critical failure
            else if (roll > level && margin <= -10) {
                result = "Critical Failure";
                time = time;
                break;
            } else if (roll === 17 && margin < 10) {
                margin = 1;
                q = q + 1;
                result = "Quirks: " + q;
                time = time;
            } else if (roll > level) {
                margin = 1;
                q = q + 1;
                result = "Quirks: " + q;
                time = time;
            }
            e = e + margin;
            t = t + time;
            ++i;
            sendChat(msg.who, "[" + i + "] Roll: " + roll +
                " vs. Level: " + level +
                " Energy Gathered: " + e + "/" + energy +
                " Time: " + t + " " + result);
            sendChat(msg.who, skill);
        }
        while (e <= energy);
        if (e > energy) {
            sendChat(msg.who, "Ritual Complete" + "Total Energy Gathered: " + e + " Elapsed Time: " + t + " " + result);
        }
    }

});

//GURPS Critical
// Critical Tables
on("chat:message", function(msg) {
    if (msg.type === "api" && /^!crit/.test(msg.content)) {
        let cmd = processInlinerolls(msg).split(/\s+/);
        var who = getObj('player', msg.playerid).get('_displayname')
            .split(' ')[0];
        var crittable = String(cmd[1]);
        var whisper = String(cmd[2]);
        var roll = randomInteger(6) + randomInteger(6) + randomInteger(6);
        var effect;
		var gmrolling = who + " GM rolling dice!";

        // ==== ==== ==== Critical Tables ==== ==== ==== //
        switch (crittable) {
            case "head":
                switch (roll) {
                    case 3:
                        effect = "<strong>The blow does maximum normal damage and ignores the target’s DR.</strong>";
                        break;
                    case 4:
                    case 5:
                        effect = "<strong>The target’s DR protects at half value</strong> (round up) after applying any armor divisors.<br />If any damage penetrates, treat it as if it were a major wound, regardless of the actual injury inflicted.";
                        break;
                    case 6:
                    case 7:
                        effect = "<strong>If the attack targeted the face or skull, treat it as an eye hit instead, even if the attack could not normally target the eye!</strong><br />If an eye hit is impossible (e.g., from behind), treat as 4:( The target’s DR protects at half value (round up) after applying any armor divisors.<br />If any damage penetrates, treat it as if it were a major wound, regardless of the actual injury inflicted. )";
                        break;
                    case 8:
                        effect = "<strong>Normal head-blow damage,</strong> and the victim is knocked off balance: he must Do Nothing next turn (but may defend normally).";
                        break;
                    case 9:
                    case 10:
                    case 11:
                        effect = "<strong>Normal head-blow damage only.</strong>";
                        break;
                    case 12:
                    case 13:
                        effect = "<strong>Normal head-blow damage,</strong> and if any damage penetrates DR, a crushing attack deafens the victim (for recovery, see Duration of Crippling Injuries, p. 422), while any other attack causes severe scarring (the victim loses one appearance level, or two levels if a burning or corrosion attack).";
                        break;
                    case 14:
                        effect = "<strong>Normal head-blow damage,</strong> and the victim drops his weapon<br />(if he has two weapons, roll randomly to see which one he drops).";
                        break;
                    case 15:
                        effect = "<strong>The blow does maximum normal damage.</strong>";
                        break;
                    case 16:
                        effect = "<strong>The blow does double damage.</strong>";
                        break;
                    case 17:
                        effect = "<strong>The target’s DR protects at half value (round up) after applying any armor divisors.</strong>";
                        break;
                    case 18:
                        effect = "<strong>The blow does triple damage.</strong>";
                        break;
                }
                break;
            case "body":
                switch (roll) {
                    case 3:
                        effect = "<strong>The blow does triple damage.</strong>";
                        break;
                    case 4:
                        effect = "<strong>The target’s DR protects at half value (round up) after applying any armor divisors.</strong>";
                        break;
                    case 5:
                        effect = "<strong>The blow does double damage.</strong>";
                        break;
                    case 6:
                        effect = "<strong>The blow does maximum normal damage.</strong>";
                        break;
                    case 7:
                        effect = "<strong>If any damage penetrates DR, treat it as if it were a major wound, regardless of the actual injury inflicted.</strong>";
                        break;
                    case 8:
                        effect = "<strong>If any damage penetrates DR, it inflicts double normal shock (to a maximum penalty of -8).</strong>If the injury is to a limb or extremity, that body part is crippled as well. This is only a “funny-bone” injury: crippling wears off in (16 - HT) seconds, minimum two seconds, unless the injury was enough to cripple the body part anyway.";
                        break;
                    case 9:
                    case 10:
                    case 11:
                        effect = "<strong>Normal damage only.</strong>";
                        break;
                    case 12:
                        effect = "<strong>Normal damage, and the victim drops anything he is holding, regardless of whether any damage penetrates DR.</strong>";
                        break;
                    case 13:
                    case 14:
                        effect = "<strong>If any damage penetrates DR, treat it as if it were a major wound, regardless of the actual injury inflicted.</strong>";
                        break;
                    case 15:
                        effect = "<strong>The blow does maximum normal damage.</strong>";
                        break;
                    case 16:
                        effect = "<strong>The blow does double damage.</strong>";
                        break;
                    case 17:
                        effect = "<strong>The target’s DR protects at half value (round up) after applying any armor divisors.</strong>";
                        break;
                    case 18:
                        effect = "<strong>The blow does triple damage.</strong>";
                        break;
                }
                break;
            case "armed":
                switch (roll) {
                    case 3:
                    case 4:
                        effect = "<strong>Your weapon breaks and is useless.</strong><br />Exception: Certain weapons are resistant to breakage. These include solid crushing weapons (maces, flails, mauls, metal bars, etc.); magic weapons; firearms (other than wheel-locks, guided missiles, and beam weapons); and fine and very fine weapons of all kinds.<br />If you have a weapon like that, roll again. Only if you get a “broken weapon” result a second time does the weapon really break. If you get any other result, you drop the weapon instead. See Broken Weapons (p. 485).";
                        break;
                    case 5:
                        effect = "<strong>You manage to hit yourself in the arm or leg (50% chance each way).</strong><br /><br />Exception: If making an impaling or piercing melee attack, or any kind of ranged attack, roll again. If you get a “hit yourself” result a second time, use that result – half or full damage, as the case may be.<br />If you get something other than “hit yourself,” use that result.";
                        break;
                    case 6:
                        effect = "<strong>As 5: (You manage to hit yourself in the arm or leg (50% chance each way).</strong><br /><br />Exception: If making an impaling or piercing melee attack, or any kind of ranged attack, roll again. If you get a “hit yourself” result a second time, use that result – half or full damage, as the case may be.<br />If you get something other than “hit yourself,” use that result.), but for half damage only.";
                        break;
                    case 7:
                        effect = "<strong>You lose your balance.</strong><br />You can do nothing else (not even a free action) until your next turn, and all your active defenses are at -2 until then.";
                        break;
                    case 8:
                        effect = "<strong>The weapon turns in your hand.</strong><br />You must take an extra Ready maneuver before you can use it again.";
                        break;
                    case 9:
                    case 10:
                    case 11:
                        effect = "<strong>You drop the weapon.</strong><br /><br /><strong>Exception:</strong> A cheap weapon breaks; see 3: (Your weapon breaks and is useless.<br /><strong>Exception:</strong> Certain weapons are resistant to breakage.<br />These include solid crushing weapons (maces, flails, mauls, metal bars, etc.); magic weapons; firearms (other than wheel-locks, guided missiles, and beam weapons); and fine and very fine weapons of all kinds.<br />If you have a weapon like that, roll again.<br />Only if you get a “broken weapon” result a second time does the weapon really break.<br />If you get any other result, you drop the weapon instead. See Broken Weapons (p. 485).)";
                        break;
                    case 12:
                        effect = "<strong>The weapon turns in your hand.</strong><br />You must take an extra Ready maneuver before you can use it again.";
                        break;
                    case 13:
                        effect = "<strong>You lose your balance.</strong><br />You can do nothing else (not even a free action) until your next turn, and all your active defenses are at -2 until then.";
                        break;
                    case 14:
                        effect = "<strong>If making a swinging melee attack, your weapon flies [[1d6]] yards from your hand – 50% chance straight forward or straight back.</strong><br />Anyone on the target spot must make a DX roll or take half damage from the falling weapon!<br />If making a thrusting melee attack or any kind of ranged attack, or parrying, you simply drop the weapon, as in 9: (You drop the weapon.<br /><br /><strong>Exception:</strong> A cheap weapon breaks; see 3: (Your weapon breaks and is useless.<br /><br /><strong>Exception:</strong> Certain weapons are resistant to breakage.<br />These include solid crushing weapons (maces, flails, mauls, metal bars, etc.); magic weapons; firearms (other than wheel-locks, guided missiles, and beam weapons); and fine and very fine weapons of all kinds. If you have a weapon like that, roll again.<br />Only if you get a “broken weapon” result a second time does the weapon really break.<br />If you get any other result, you drop the weapon instead. See Broken Weapons (p. 485).))";
                        break;
                    case 15:
                        effect = "<strong>You strain your shoulder!</strong><br />Your weapon arm is “crippled.”<br />You do not have to drop your weapon, but you cannot use it, either to attack or defend, for 30 minutes.";
                        break;
                    case 16:
                        effect = "<strong>You fall down!</strong><br />If making a ranged attack; You lose your balance.<br />You can do nothing else (not even a free action) until your next turn, and all your active defenses are at -2 until then.";
                        break;
                    case 17:
                    case 18:
                        effect = "<strong>Your weapon breaks;</strong><br />see 3: (Your weapon breaks and is useless.<br /><br /><strong>Exception:</strong> Certain weapons are resistant to breakage. These include solid crushing weapons (maces, flails, mauls, metal bars, etc.); magic weapons; firearms (other than wheel-locks, guided missiles, and beam weapons); and fine and very fine weapons of all kinds.<br />If you have a weapon like that, roll again.<br />Only if you get a “broken weapon” result a second time does the weapon really break.<br />If you get any other result, you drop the weapon instead.<br />See Broken Weapons (p. 485).).";
                        break;
                }
                break;
            case "unarmed":
                switch (roll) {
                    case 3:
                        effect = "<strong>You knock yourself out!</strong><br />Details are up to the GM – perhaps you trip and fall on your head, or walk facefirst into an opponent’s fist or shield. Roll vs. HT every 30 minutes to recover.";
                        break;
                    case 4:
                        effect = "<strong>If attacking or parrying with a limb, you strain it: take 1 HP of injury and the limb is “crippled.”</strong><br />You cannot use it, either to attack or defend, for 30 minutes.<br />If biting, butting, etc., you pull a muscle and suffer moderate pain (see Irritating Conditions, p. 428) for the next (20 - HT) minutes, minimum one minute.";
                        break;
                    case 5:
                    case 16:
                        effect = "<strong>You hit a solid object (wall, floor, etc.)</strong><br />instead of striking your foe or parrying his attack.<br />You take crushing damage equal to your thrusting damage to the body part you were using; DR protects normally.<br /><strong>Exception:</strong> If attacking a foe armed with a ready impaling weapon, you fall on his weapon! You suffer the weapon’s damage, but based on your ST rather than his.";
                        break;
                    case 6:
                        effect = "<strong>You hit a solid object (wall, floor, etc.)</strong><br />instead of striking your foe or parrying his attack.<br />You take crushing damage equal to your thrusting damage to the body part you were using; DR protects normally.<br /><br /><strong>Exception:</strong> If attacking a foe armed with a ready impaling weapon, you fall on his weapon!<br />You suffer the weapon’s damage, but based on your ST rather than his, but half damage only.<br /><strong>Exception:</strong> If attacking with natural weapons, such as claws or teeth, they break: -1 damage on future attacks until you heal (for recovery, see Duration of Crippling Injuries, p. 422).";
                        break;
                    case 7:
                    case 14:
                        effect = "<strong>You stumble.</strong><br />On an attack, you advance one yard past your opponent and end your turn facing away from him; he is now behind you!<br />On a parry, you fall down.";
                        break;
                    case 8:
                        effect = "<strong>You fall down!<b/>";
                        break;
                    case 9:
                    case 10:
                    case 11:
                        effect = "<strong>You lose your balance.</strong><br />You can do nothing else (not even a free action) until your next turn, and all your active defenses are at -2 until then.";
                        break;
                    case 12:
                        effect = "<strong>You trip.</strong><br />Make a DX roll to avoid falling down. Roll at DX-4 if kicking, or at twice the usual DX penalty for a technique that requires a DX roll to avoid mishap even on a normal failure (e.g., DX-8 for a Jump Kick).";
                        break;
                    case 13:
                        effect = "<strong>You drop your guard.</strong><br />All your active defenses are at -2 for the next turn, and any Evaluate bonus or Feint penalty against you until your next turn counts double! This is obvious to nearby opponents.";
                        break;
                    case 15:
                        effect = "<strong>You tear a muscle.</strong><br />Take [[1d3]] of injury to the limb you used (to one limb, if you used two), or to your neck if biting, butting, etc.<br /> You are off balance and at -1 to all attacks and defenses for the next turn. You are at -3 to any action involving that limb (or to any action, if you injure your neck!) until this damage heals.<br />Reduce this penalty to -1 if you have High Pain Threshold.";
                        break;
                    case 17:
                        effect = "<strong>You strain a limb or pull a muscle,</strong><br />as in 4.<br /><br />Exception: An IQ 3-5 animal fails so miserably that it loses its nerve.<br />It will turn and flee on its next turn, if possible. If backed into a corner, it will assume a surrender position (throat bared, belly exposed, etc.).";
                        break;
                    case 18:
                        effect = "<strong>You knock yourself out;</strong><br />see 3.<br /><br />Fighters that cannot fall down (e.g., snakes, and anyone already on the ground): Treat any “fall down” result as [[1d3]] of general injury instead. Details are up to the GM – perhaps your opponent steps on you!<br /><br />Fliers and swimmers: Treat any “fall down” result as being forced into an awkward flying or swimming position with the same effective results (-4 to attack, -3 to defend).";
                        break;
                }
                break;

                // Critical Spell Failure Table
            case "magic":
                switch (roll) {
                    case 3:
                        effect = "<strong>Spell fails entirely. Caster takes</strong> [[1d6]] <strong>of injury.</strong>";
                        break;
                    case 4:
                        effect = "<strong>Spell is cast on caster (if harmful) or on a random nearby foe (if beneficial).</strong>";
                        break;
                    case 5:
                    case 6:
                        effect = "<strong>Spell is cast on one of the caster’s companions (if harmful) or on a random nearby foe (if beneficial).</strong>";
                        break;
                    case 7:
                        effect = "<strong>Spell affects someone or something other than its intended target – friend, foe, or random object.</strong><br />Roll randomly or make an interesting choice.";
                        break;
                    case 8:
                        effect = "<strong>Spell fails entirely. Caster takes 1 point of injury.</strong>";
                        break;
                    case 9:
                        effect = "<strong>Spell fails entirely. Caster is stunned (IQ roll to recover).</strong>";
                        break;
                    case 10:
                    case 11:
                        effect = "<strong>Spell produces nothing but a loud noise, bright flash of light, awful odor, etc.</strong>";
                        break;
                    case 12:
                        effect = "<strong>Spell produces a weak and useless shadow of the intended effect.</strong>";
                        break;
                    case 13:
                        effect = "<strong>Spell produces the reverse of the intended effect.</strong>";
                        break;
                    case 14:
                        effect = "<strong>Spell seems to work, but it is only a useless illusion.</strong><br />The GM should do his best to convince the wizard and his companions that the spell did work!";
                        break;
                    case 15:
                    case 16:
                        effect = "<strong>Spell has the reverse of the intended effect, on the wrong target.</strong><br />Roll randomly.";
                        break;
                    case 17:
                        effect = "<strong>Spell fails entirely.</strong><br />Caster temporarily forgets the spell. Make an IQ roll after a week, and again each following week, until he remembers.";
                        break;
                    case 18:
                        effect = "<strong>Spell fails entirely.</strong><br />A demon or other malign entity appropriate to the setting appears and attacks the caster. (The GM may waive this result if, in his opinion, caster and spell were both lily-white, pure good in intent.)";
                        break;
                }
                break;
        }

        //Log Message Contents
        // critsucc & critfail
        log(msg.content);
        // Send Template to Chat	
        if (whisper === "public") {
            // Send to Public
            sendChat(msg.who,
                `&{template:GURPSGM} {{criteffect=${effect}}}`
            );
        } else if (whisper === "secret") {
            // Send to GM
            sendChat(msg.who,
                `/w gm &{template:GURPSGMGM} {{criteffect=${effect}}}`
            );
            // Send to Player             
            sendChat(msg.who, `/w ` + who +
                `&{template:GURPSGM} {{criteffect=${effect}}}`
            );
        } else if (whisper === "gm") {
            // Send to GM
            sendChat(msg.who,
                `/w gm &{template:GURPSGMGM} {{criteffect=${effect}}}`
            );
            // Send to Public    
            sendChat(msg.who, `&{template:GURPSGMROLLING} {{gmrolling=${gmrolling}}}`);
        }
    }

});
