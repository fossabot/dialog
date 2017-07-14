/*
 *
 * Asynchronous Modal Dialog Window, a utility which can replace the default JavaScript dialog windows for webpages (alert(), prompt(), confirm())
 *
 * The program integrates 3 elements.
 *
 * ## The first is a global Object named `dialogSettings` that you can use to modify the default behavior of the dialog windows ##
 *
 * __object_key__   __type__   __default_value__       __comment__
 * defType          string     "alert"                 default type
 * defTitle         string     "Message"               default title
 * defContent       string     "<i>Missing text</i>"   default message of the dialog
 * okText           string     "OK"                    default content of the <ok> button
 * continueText     string     "Continue"              default content of the <continue> button
 * cancelText       string     "Cancel"                default content of the <cancel> button
 *
 *
 * ## The second element is the main Function, `dialog()`, which needs the following options, passed with an object as first argument ##
 *
 * __object_key__   __type__   __comment__
 * type             string     type of the dialog window. Possible values are ['alert', 'prompt', 'confirm']
 * title            string     text which will be displayed as the title of the dialog window
 * content          string     message of the dialog window
 * placeholder      string     if the type is 'prompt', this will define a placeholder text for the input box
 * id               string     identifier which can be retrieved afterwards in the `returnObj`, on the callback function
 * vars             Object     object of convenience that will be returned in the `returnObj`, on the callback function
 * callback         Function   function to be called when the dialog window is closed
 *
 *
 * ## The last one is an Object that will be returned in the callback function as first argument, named `returnObj` for convenience of this guide ##
 *
 * __object_key__   __type__   __comment__
 * id               string     identifier passed when calling the `dialog()` function, defaults to undefined
 * vars             Object     same object passed with the function (NB: same reference), defaults to undefined
 * action           boolean    `true` if the user has pressed <ok> or <continue>, `false` for <cancel>
 * value            string     if the type of the requested dialog window was "prompt" it will contain the value inserted in the input box, otherwise it will be undefined
 *
 * ================================================================================================
 *
 * Version: 2.0.1
 * Copyright (c) 2015 Matteo Bernardini
 * Licensed under the MIT License (refer to the LICENSE file for further information).
 *
 * Check this project on GitHub:
 * http://github.com/mttbernardin/dialog
 *
 */



// Backwards compatibility with IE < 9
if (!window.addEventListener) {
	Object.defineProperties(Element.prototype, {
		"addEventListener": {
			value: function(evt, handler, capture) {
				this.attachEvent("on"+evt, handler);
			}
		},
		"removeEventListener": {
			value: function(evt, handler, capture) {
				this.detachEvent("on"+evt, handler);
			}
		},
	});
}


// MAIN FUNCTION //

var dialogSettings = new Object();

function dialog(params) {

	params         = params         || new Object();
	dialogSettings = dialogSettings || new Object();

	// == Default Values == //
	dialogSettings.defTitle     =  dialogSettings.defTitle      ||  "Message";
	dialogSettings.defType      =  dialogSettings.defType       ||  "alert";
	dialogSettings.defContent   =  dialogSettings.defContent    ||  "Missing text";
	dialogSettings.okText       =  dialogSettings.okText        ||  "OK";
	dialogSettings.continueText =  dialogSettings.continueText  ||  "Continue";
	dialogSettings.cancelText   =  dialogSettings.cancelText    ||  "Cancel";

	// == Switch between default values or passed values == //
	params.title    =  params.title    ||  dialogSettings.defTitle;
	params.type     =  params.type     ||  dialogSettings.defType;
	params.content  =  params.content  ||  dialogSettings.defContent;


	// == Creating elements == //
	var parts = {
	    	"div":     ["window", "wrapper", "title", "body", "message", "prompt", "actions"],
	    	"button":  ["ok", "cancel"]
	    },
	    elms = {};

	for (var elemType in parts) if (parts.hasOwnProperty(elemType)) {
		elms[elemType] = {};
		for (var j = 0, part; part = parts[elemType][j]; j++) {
			elms[elemType][part] = document.createElement(elemType);
			elms[elemType][part].className = "dialog-" + part;
			if (elemType === "button") {
				elms[elemType][part].className += "-button";
				elms[elemType][part].type = "button";
				elms[elemType][part].setAttribute("data-action", part);
			}
		}
	}

	var prompt = document.createElement("input");
	prompt.setAttribute("type", "text");
	prompt.className = "dialog-prompt-input";


	// == Arranging elements == //
	elms["div"]["window"].appendChild(elms["div"]["wrapper"]);
	elms["div"]["wrapper"].appendChild(elms["div"]["title"]);
	elms["div"]["wrapper"].appendChild(elms["div"]["body"]);
	elms["div"]["body"].appendChild(elms["div"]["message"]);
	elms["div"]["actions"].appendChild(elms["button"]["ok"]);

	switch (params.type) {
		case "prompt":
			elms["div"]["prompt"].appendChild(prompt);
			elms["div"]["body"].appendChild(elms["div"]["prompt"]);
		case "confirm": // or "prompt", notice no break here
			elms["div"]["actions"].appendChild(elms["button"]["cancel"]);
	}

	elms["div"]["body"].appendChild(elms["div"]["actions"]);


	// == Assigning values == //
	elms["div"]["title"].textContent        =  params.title;
	elms["div"]["message"].textContent      =  params.content;
	elms["button"]["ok"].textContent        =  params.type === "confirm" ? dialogSettings.continueText : dialogSettings.okText;
	elms["button"]["cancel"].textContent    =  dialogSettings.cancelText;
	prompt.placeholder                      =  params.placeholder || "";


	// == Appending to body & focus == //
	var dialogWindow = elms["div"]["window"];
	dialogWindow.setAttribute("data-dialog-type", params.type);

	document.body.appendChild(dialogWindow);

	if (params.type === "prompt")
		prompt.focus();



	// == Adding event listeners == //

	// Will be triggered when closing the dialog
	function action(e, userAction) {
		e = e || window.event;
		var target = e.target ? e.target : e.srcElement;

		if (typeof userAction === "boolean" || target.getAttribute("data-action") === "ok" || target.getAttribute("data-action") === "cancel") {
			document.removeEventListener("keyup", useKeys, false);
			document.body.removeChild(dialogWindow);
			//Callback function if defined
			if (params.callback) {
				var returnObj = {
					id: params.id,
					action: typeof userAction === "boolean" ? userAction : target.getAttribute("data-action") === "ok",
					value: prompt.value,
					vars: params.vars
				};
				params.callback(returnObj);
			}
		}
	}

	// Handler for keyboard events
	function useKeys(e) {
		e = e || window.event;
		if (e.keyCode === 13) // ENTER key
			action(null, true);
		else if (e.keyCode === 27 && params.type !== "alert") // ESC key
			action(null, false);
	}

	document.addEventListener("keyup", useKeys, false);
	elms["div"]["actions"].addEventListener("click", action, false);

}
