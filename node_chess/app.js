global.BASE_DIR = __dirname;
global.APP      = BASE_DIR + "/app/";
global.CON      = APP + "/controller/";
global.CORE     = APP + "/core/";
global.MODULE   = BASE_DIR + "/node_modules/";
global.CONF     = BASE_DIR + "/conf/";
global.STATIC   = BASE_DIR + "/static/";
global.VIEW     = BASE_DIR + "/view/";

global.lib = {
	http        : require('http'), 
	fs          : require('fs'),
	url   	    : require('url'),
	querystring : require('querystring'),
	httpParam   : require(MODULE + 'http_param'),
	staticModule: require(MODULE + 'static_module'),
	router      : require(CORE + 'router'),
	ejs         : require(MODULE + 'ejs'),
	socket      : require('socket.io'),
    path        : require('path'),
    session     : require(MODULE + 'node_session')
}
global.onlineList = {};
global.roomChooseStr = lib.fs.readFileSync(VIEW + 'roomChoose.ejs','utf8');
global.app = lib.http.createServer(function(req,res){
	var pathname = lib.url.parse(req.url).pathname;
	lib.router.router(res, req);
}).listen(1337);

global.io = lib.socket.listen(app);
