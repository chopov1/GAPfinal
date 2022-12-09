//use ctrl c to stop the program running and gain control of the console
//ThreeJS is a Y-up platform
//use f12 on website to debug
//use "npm init -y" to create package.json
//use "npm i parcel" to create node-modules - use "npm i parcel@2.7.0" if you get version error
//use "npm install three" to install threejs library
//use "npm install cannon-es" to install cannon library
//to run type "parcel ./src/index.html"
//bg pic found at https://duckduckgo.com/?q=windows+default+background+square&iax=images&ia=images&iai=https%3A%2F%2Favatarfiles.alphacoders.com%2F280%2F280762.jpg

import * as THREE from "three";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {Mesh, Object3D, Vector3} from "three";
import * as CANNON from 'cannon-es';
import * as dat from 'dat.gui'
import { MeshStandardMaterial } from "three";
import windowsBkg from '../img/280762.jpg'
import { Vec3 } from "cannon-es";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import gsap from 'gsap';

//#region setup

const renderer = new THREE.WebGL1Renderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1,1000);
camera.position.set(-10,30,30);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();
scene.add(camera);

const light = new THREE.DirectionalLight( 0xFFFFFF );
light.castShadow = true;
scene.add(light);

const ambLight = new THREE.AmbientLight(0x404040);
scene.add(ambLight);

const axisHelper = new THREE.AxesHelper(20);
scene.add(axisHelper);

const textureLoader = new THREE.TextureLoader();
scene.background = textureLoader.load(windowsBkg);
//#endregion

//#region objects


const ring1Geo = new THREE.TorusGeometry(8,1,80,40);
const ring1Mat = new MeshStandardMaterial({color: 0xFFEB3B});
const ring1 = new Mesh(ring1Geo, ring1Mat);
scene.add(ring1);
ring1.position.set(0,40,0);
ring1.rotateX(Math.PI/2);

const ring2Geo = new THREE.TorusGeometry(4,1,40,40);
const ring2Mat = new MeshStandardMaterial({color: 0xFFEB3B});
const ring2 = new Mesh(ring2Geo, ring2Mat);
scene.add(ring2);
ring2.position.set(0,80,0);
ring2.rotateX(Math.PI/2);

//#region wagonParts
const floorObj = new Object3D();
const floorGeo = new THREE.BoxGeometry(20, 10, 20);
const floorMat = new MeshStandardMaterial({color: 0x00ffff});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.name = "ground";
floorObj.add(floor);
scene.add(floorObj);

const wall1Geo = new THREE.BoxGeometry(20, 6, 2);
const wall1Mat = new MeshStandardMaterial({color: 0xF8BBD0});
const wall1 = new THREE.Mesh(wall1Geo, wall1Mat);
wall1.position.set(0, 7, 10);
floorObj.add(wall1);

const wall2Geo = new THREE.BoxGeometry(20, 6, 2);
const wall2Mat = new MeshStandardMaterial({color: 0xF8BBD0});
const wall2 = new THREE.Mesh(wall2Geo, wall2Mat);
wall2.position.set(0, 7, -10);
floorObj.add(wall2);

const wall3Geo = new THREE.BoxGeometry(2, 6, 20);
const wall3Mat = new MeshStandardMaterial({color: 0xF8BBD0});
const wall3 = new THREE.Mesh(wall3Geo, wall3Mat);
wall3.position.set(10, 7, 0);
floorObj.add(wall3);

const wall4Geo = new THREE.BoxGeometry(2, 6, 20);
const wall4Mat = new MeshStandardMaterial({color: 0xF8BBD0});
const wall4 = new THREE.Mesh(wall4Geo, wall4Mat);
wall4.position.set(-10, 7, 0);
floorObj.add(wall4);
//#endregion

const cargoGeo1 = new THREE.BoxGeometry(2,2,2);
const cargoMat1 = new THREE.MeshStandardMaterial({color: 0xffbbee});
const cargo1 = new THREE.Mesh(cargoGeo1, cargoMat1);
scene.add(cargo1);

//#region gltf
const dinoURL = new URL('../assets/stegosaurs_SStenops.glb', import.meta.url);
const boyURL = new URL('../assets/Cartoon_boy.glb', import.meta.url);

const dinoObj = new Object3D();

const assetLoader = new GLTFLoader();
assetLoader.load(dinoURL.href,function(gltf){
    const dinomodel = gltf.scene;
    dinoObj.add(dinomodel);
    scene.add(dinoObj);
    //dinomodel.position.set(0,12,0);
},
undefined,
function(error){
    console.error(error);
}
)

const boyPos = new THREE.Vector3(0,150,0);

assetLoader.load(boyURL.href,function(gltf){
    const boymodel = gltf.scene;
    scene.add(boymodel);
    boymodel.position.set(0,150,0);
})

//#endregion

//#endregion

//#region cannon

//#region cannon world setup
const world = new CANNON.World({
    gravity: new CANNON.Vec3(0,-10,0)
});

const floorPhyMat = new CANNON.Material();
const objPhyMat = new CANNON.Material();
const floorObjContactMat = new CANNON.ContactMaterial(floorPhyMat,objPhyMat, {restitution: .7} );
world.addContactMaterial(floorObjContactMat);
//#endregion

//#region wagonPartBodies
const floorBody = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(10,5,10)),
    type: CANNON.Body.STATIC,
    material: floorPhyMat,
    position: new Vec3(0,0,0)
});
world.addBody(floorBody);

const wall1Body = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(10,3,1)),
    type: CANNON.Body.STATIC,
    material: floorPhyMat,
    position: new Vec3(0,0,0)
});
world.addBody(wall1Body);

const wall2Body = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(10,3,1)),
    type: CANNON.Body.STATIC,
    material: floorPhyMat,
    position: new Vec3(0,0,0)
});
world.addBody(wall2Body);

const wall3Body = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(1,3,10)),
    type: CANNON.Body.STATIC,
    material: floorPhyMat,
    position: new Vec3(0,0,0)
});
world.addBody(wall3Body);

const wall4Body = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(1,3,10)),
    type: CANNON.Body.STATIC,
    material: floorPhyMat,
    position: new Vec3(0,0,0)
});
world.addBody(wall4Body);
//#endregion


const cargo1Body = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(1,1,1)),
    mass: 0.5,
    material: objPhyMat,
    position: new Vec3(0, 10, 0)
})
world.addBody(cargo1Body);

const dinoBody = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(1,1,1)),
    mass: .8,
    material: objPhyMat,
    position: new Vec3(0,12,0)
})
world.addBody(dinoBody);

//#endregion

//#region UI

const gui = new dat.GUI();

const guiOptions = {
WagonColor: '#0000FF', 
WagonHeight: 0,
ShowGoals: false,
};

gui.addColor(guiOptions, 'WagonColor').onChange(function(e){
    floor.material.color.set(e)
});

const tl = gsap.timeline();
gui.add(guiOptions, "ShowGoals").onChange(function(e){
    tl.to(camera.position, {z:-90,y:28, duration:1, onUpdate: function(){camera.lookAt(ring1.position)}})
    .to(camera.position, {y:70, z:-120, duration: 3, onUpdate: function(){camera.lookAt(ring1.position); }})
    .to(camera.position, {y: 90, z: -90, duration: 3, onUpdate: function(){camera.lookAt(ring2.position)}})
    .to(camera.position, {y: 180, z: 18, x: -10, duration: 3, onUpdate: function(){camera.lookAt(boyPos)}})
    .to(camera.position, {y: 90, z: 0, x:0, duration: 4, onUpdate: function(){camera.lookAt(0,0,0)}});
})

gui.add(guiOptions, "WagonHeight", -5, 5);

//#endregion

var timestep = 1/60;

//#region ObjectSpawning

const grid = new THREE.GridHelper(20, 20);
scene.add(grid);
const planeGeo = new THREE.PlaneGeometry(1,1);
const planeMat = new THREE.MeshStandardMaterial({color:0xeeeeee, side: THREE.DoubleSide});
const planeSmall = new THREE.Mesh(planeGeo, planeMat);
planeSmall.position.setX(.5);
planeSmall.position.setZ(.5);
planeSmall.rotateX(Math.PI/2);
scene.add(planeSmall);

//------------ CREATE SPAWNABLE OBJECTS ---------

const torusGeo = new THREE.TorusGeometry(.2, .5, 20);
const torusMat = new THREE.MeshStandardMaterial({color:0xeeffaa});
const torusMesh = new THREE.Mesh(torusGeo, torusMat);

const boxGeo = new THREE.BoxGeometry(1,1,1);
const boxMat = new THREE.MeshStandardMaterial({color:0x111111});
const boxMesh = new THREE.Mesh(boxGeo, boxMat);

const sphereGeo = new THREE.SphereGeometry(.5,20);
const sphereMat = new THREE.MeshStandardMaterial({color:0xbbccbb});
const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);

const doGeo = new THREE.DodecahedronGeometry(.6, 0);
const doMat = new THREE.MeshStandardMaterial({color:0xbbccee});
const doMesh = new THREE.Mesh(doGeo, doMat);

const coneGeo = new THREE.ConeGeometry(.5, 1);
const coneMat = new MeshStandardMaterial({color:0xeebbee});
const coneMesh = new THREE.Mesh(coneGeo, coneMat);

//--------- MOUSE MOVE -------------
const mousepos = new THREE.Vector2;
const raycaster = new THREE.Raycaster();
let intersects;

window.addEventListener('mousemove', function(e){

    mousepos.x = (e.clientX / window.innerWidth) * 2 -1;
    mousepos.y = (e.clientY/ window.innerHeight) * 2 -1;

    raycaster.setFromCamera(mousepos, camera);
    intersects = raycaster.intersectObjects(scene.children);

    intersects.forEach(function(intersect){
        if(intersect.object.name === 'ground'){
            const highlightPos = new THREE.Vector3().copy(intersect.point).floor().addScalar(0.5);
            planeSmall.position.set(highlightPos.x, 0, -highlightPos.z);

            const exists = objects.find(function(object){
                return ((object.position.x === planeSmall.position.x) && (object.position.z === planeSmall.position.z));
            });
            if(!exists){
                planeSmall.material.color.setHex(0xffffff);
            }
            else{
                planeSmall.material.color.setHex(0xffbbdd);
            }
            
        }
    });
    const exists = objects.find(function(object){

        return ((object.position.x === planeSmall.position.x) && (object.position.z === planeSmall.position.z));
    });
    if(!exists){
        planeSmall.material.color.setHex(0xffffff);
    }
    else{
        planeSmall.material.color.setHex(0xffbbdd);
    }
});

const spawnableObjs = [torusMesh, boxMesh, sphereMesh, doMesh, coneMesh];
const objects = [];
const objectBodies = [];
window.addEventListener('mousedown', function(e){

    var index = Math.floor(Math.random() * spawnableObjs.length);
    const exists = objects.find(function(object){
        return ((object.position.x === planeSmall.position.x) && (object.position.z === planeSmall.position.z));
    });
    if(!exists){
        intersects.forEach(function(intersect){
            if(intersect.object.name === 'ground'){
                const objToSpawn = spawnableObjs[index].clone();
                const objBody = new CANNON.Body({
                    shape: new CANNON.Sphere(.5),
                    mass: 1,
                    material: objPhyMat
                });
            objToSpawn.material.color.setHex(Math.random(0, 1) * 0xaaaaaa);
            objToSpawn.rotateX((Math.floor(Math.random() * 360)));
            objToSpawn.rotateZ((Math.floor(Math.random() * 360)));
            objToSpawn.position.copy(planeSmall.position);
            objToSpawn.position.setY(20+Math.floor(Math.random() * 9) + 1);
            objBody.angularVelocity.set(0,10,0);
            objBody.angularDamping = 0.8;
            objBody.position.copy(objToSpawn.position);
            objBody.quaternion.copy(objToSpawn.quaternion);
            scene.add(objToSpawn);
            world.addBody(objBody);
            objects.push(objToSpawn);
            objectBodies.push(objBody);
            }
        });
    }
    if(!exists){
        planeSmall.material.color.setHex(0xffffff);
    }
    else{
        planeSmall.material.color.setHex(0xaaaaaa);
    }
    
    console.log(index);
    console.log(spawnableObjs.length);
});

//#endregion

function animate(){

    world.step(timestep);

    floorBody.position.set(0,guiOptions.WagonHeight,0);

    cargo1.position.copy(cargo1Body.position);
    cargo1.quaternion.copy(cargo1Body.quaternion);

    dinoObj.position.copy(dinoBody.position);
    dinoObj.quaternion.copy(dinoBody.quaternion);

    for (let index = 0; index < objects.length; index++) {
        objects[index].position.copy(objectBodies[index].position);
        objects[index].quaternion.copy(objectBodies[index].quaternion);
    }

    //#region updateWagonParts
    floorObj.position.copy(floorBody.position);
    floorObj.quaternion.copy(floorBody.quaternion);
    wall1Body.position.copy(wall1.position);
    wall1Body.quaternion.copy(wall1.quaternion);
    wall2Body.position.copy(wall2.position);
    wall2Body.quaternion.copy(wall2.quaternion);
    wall3Body.position.copy(wall3.position);
    wall3Body.quaternion.copy(wall3.quaternion);
    wall4Body.position.copy(wall4.position);
    wall4Body.quaternion.copy(wall4.quaternion);
    //#endregion

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', function (){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
})