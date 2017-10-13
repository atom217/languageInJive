/**
 * API
 * @constructor
 * @param {String} appUrl
 * @param {Number} placeID
 * @param {Number} containerID current container id
 */
var API = function(appUrl, placeID, containerID) {
    if (appUrl === undefined || placeID === undefined || Number(placeID) === NaN) {
        return { invalid: true, reason: "appUrl or placeID is not defined" };
    } else {
        this.jiveAppURL = appUrl + "/places/" + placeID;
    }

    this.api = osapi;

    this.containerID = containerID;

    this.ideasReturnedCount = C_IDEAS_COUNT_LIST; //number of ideas returned

    this.debug = true;
};


/**
 * getIdeas
 * @method
 * @param {String} sort type
 * @returns {Object} list of keys
 */
API.prototype.getIdeas = function(_sort) {

    if (this.debug === true) console.debug("API.getIdeas args : ", _sort);

    return new Promise(function(resolve, reject) {

        this.api.jive.corev3.ideas.get({
            "place": this.jiveAppURL
        }).execute(function(results) {
            if (results.error) throw new Error("Fail to get results", results.error.code, results.error.message);

            resolve(results);
        }.bind(this));
    }.bind(this));
};


/**
 * createIdea
 * @method
 * @param {Object} args of idea
 * @return {Promise} 
 */
API.prototype.createIdea = function(args) {
    //this.api.jive.corev3.ideas.get


    var tags_ideas = args.tags.length !== 0 ? [args.tags] : [];

    if (this.debug === true) console.debug("API.createIdea args : ", args.subject, this.formatIdeaContent(args), tags_ideas, this.jiveAppUrl);


    return new Promise(function(resolve, reject) {


        //idea creation
        this.api.jive.corev3.ideas.create({
            subject: args.subject,
            content: {
                "type": "text/html",
                "text": this.formatIdeaContent(args)
            },
            parent: this.jiveAppURL,
            tags: tags_ideas
        }).execute(function(idea) {
            if (idea.error) reject("Fail to create idea", idea.error.code, idea.error.message);
            //setup external properties
            idea.createExtProps(args.extProps).execute(function(res) {
                console.info("res", res);
                if (res.error) reject("Fail to add extraProperties", res.error.code, res.error.message);
                resolve(idea.id);
            });
        });
    }.bind(this));

};

/**
 * formatIdeaContent
 */
API.prototype.formatIdeaContent = function(args) {
    if (this.debug === true) console.debug("API.updateIdea args : ", args);


    var container = $('<div>', {
        style: 'padding: 1em;background-color:#ffffff;'
    });

    var body = $('<p>', {
      style: 'color:#000000; margin : 1em 0;'
    })
      .append(args.content)
      .appendTo(container);

    var props = $('<div>');

    for (var property in args.meta) {
        if (args.meta.hasOwnProperty(property)) {
            $('<div>', {
              style: 'margin-bottom: .5em; padding-bottom: .5em;'
            })
                .append($('<h2>', {
                    style: "color:#FF7900;font-weight:700;"
                }).append(property))
                .append($('<p>').append(args.meta[property]))
                .appendTo(props);
        }
    }

    props.appendTo(container);

    return container[0].outerHTML;
};

/**
 * search Idea
 * @param {String} Name of the idea
 * @param {String} filter of the idea
 * @return {Object} Results
 */
API.prototype.search = function(ideaName, filter) {

    if (this.debug === true) console.debug("API.search args : ", ideaName, this.jiveAppURL);

    var ideaArray = [];

    console.log(this.jiveAppURL, ideaName, this.ideasReturnedCount);

    return new Promise(function(resolve, reject) {
        this.api.jive.corev3.ideas.get({
            "place": this.jiveAppURL,
            "search": ideaName,
            "count": this.ideasReturnedCount
            // "tag" : filter
        }).execute(function(results) {
            if (results.error) reject("Fail to get results", results.error.code, results.error.message);


            results.list.forEach(function(idea) {
                ideaArray.push({ id: idea.id, title: idea.subject, date: idea.published, author: idea.author.displayName, tags: idea.tags.join(", ") });
            });

            resolve(ideaArray);
        });
    }.bind(this));

};


API.prototype.addAttachement = function(args) {

};
