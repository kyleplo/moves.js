var net, movesDefaults, movesRegistry;
movesRegistry = {};
async function movesReady(f, s, o, a){
 net = await posenet.load(a || 0.75);
 movesDefaults = {};
 movesDefaults.flip = f;
 movesDefaults.size = s || 0.5;
 movesDefaults.output = o || 16;
 return new Promise(function (y,n){y(net)});
}
async function moves(i, a){
 var poseObj;
 if(i.keypoints){
  poseObj = i;
 }else{
  poseObj = await net.estimateSinglePose(i, movesDefaults.size, movesDefaults.flip, movesDefaults.output);
 };
 var pose = poseObj.keypoints;
 var bodyXCenter = (pose[5].position.x + pose[6].position.x + pose[11].position.x + pose[12].position.x) / 4;
 var bodyYCenter = (pose[5].position.y + pose[6].position.y + pose[11].position.y + pose[12].position.y) / 4;
 var headY = (pose[0].position.y + pose[1].position.y + pose[2].position.y + pose[3].position.y + pose[4].position.y) / 5;
 var a = a || 10;
 return new Promise(function (y,n){
  var data = {
   headTippedLeft: Math.round(pose[1].position.y / a) > Math.round(pose[2].position.y / a),
   headTippedRight: Math.round(pose[1].position.y / a) < Math.round(pose[2].position.y / a),
   leftHandUp: pose[9].position.y < headY,
   rightHandUp: pose[10].position.y < headY,
   leftHandOut: Math.round(pose[9].position.x / a) < (bodyXCenter / a),
   rightHandOut: Math.round(pose[10].position.x / a) > (bodyXCenter / a),
   leftHandOutRight: Math.round(pose[9].position.x / a) > (bodyXCenter / a),
   rightHandOutLeft: Math.round(pose[10].position.x / a) < (bodyXCenter / a),
   leftLegUp: Math.round(pose[15].position.y) < Math.round(pose[13].position.y),
   rightLegUp: Math.round(pose[16].position.y) < Math.round(pose[14].position.y),
   headTurnedLeft: Math.round(pose[0].position.x / a) < (bodyXCenter / a),
   headTurnedRight: Math.round(pose[0].position.x / a) > (bodyXCenter / a)
  };
  var moveNames = Object.keys(movesRegistry);
  var dataValues = Object.keys(data);
  var results = [];
  for(var i = 0; i < moveNames.length; i++){
   var couldBe = true;
   for(var x = 0; x < dataValues.length; x++){
    if((movesRegistry[moveNames[i]] === undefined) || (data[dataValues[x]] === movesRegistry[moveNames[i]])){
     couldBe = true;
    }else{
     couldBe = false;
    };
   };
   if(couldBe){
    results.push(moveNames[i]);
   };
  };
  data.moves = results;
  y(data);
 });
}
function registerMove(t, o){
 movesRegistry[t] = o;
}
