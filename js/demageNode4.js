/// <reference path='./babylon.d.ts' />
var scene;
var camera;

async function createScene() {


    async function initScene() {
      
        scene = new BABYLON.Scene(engine);
        //scene.autoClear = false;
        scene.clearColor = new BABYLON.Color3.FromInts(12, 12, 12);
        scene.imageProcessingConfiguration.contrast=1.8;
        scene.imageProcessingConfiguration.exposure=1.3;
        scene.imageProcessingConfiguration.toneMappingEnabled = true;
        scene.imageProcessingConfiguration.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;

     
        var light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 0.3;
        
        var lightP = new BABYLON.PointLight("lightp", new BABYLON.Vector3(0, 1, 0), scene);
        lightP.intensity = 0.02;
        lightP.position = new BABYLON.Vector3(-0.11,1.36,0.34);
        
        var lightD = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(0.342, -0.541, -0.769), scene);
        lightD.intensity = 0.32;

        lightD.position = new BABYLON.Vector3(-0.043,1.326,0.160);
        lightD.diffuse = new BABYLON.Color3.FromHexString("#DDBCBC").toLinearSpace();
        lightD.specular = new BABYLON.Color3.FromHexString("#CCC8A7").toLinearSpace();


        //camera = new BABYLON.ArcRotateCamera("camera", Math.PI/2, 3, 10, new BABYLON.Vector3(0.0, 0.0, 0.0), scene);
        camera = new BABYLON.ArcRotateCamera("Cam_config", -Math.PI, Math.PI / 2, 0, new BABYLON.Vector3(0, 0, 0), scene);
        camera.setTarget(new BABYLON.Vector3(-0.087, 1.268, -0.056))
        camera.alpha=14.4936;
        camera.beta=1.5786;
        camera.radius=0.4648;
        //camera.setPosition(new BABYLON.Vector3(33.9, 7.84, -64.5))
        //camera.fov = 0.5;
        // var pipeline = new BABYLON.DefaultRenderingPipeline("default", true, scene);
        // pipeline.fxaaEnabled = true;
        // pipeline.fxaa.samples = 2; //1 by default
        // pipeline.fxaa.adaptScaleToCurrentViewport = true; //false by default
        // pipeline.samples = 5;
        // pipeline.sharpenEnabled = true;
   
        camera.upperRadiusLimit = 0.8;
        camera.lowerRadiusLimit = 0.1;
        camera.wheelPrecision = 1000;
        camera.pinchPrecision = 500;

        camera.allowUpsideDown = true;
        camera.minZ = 0.01;

        scene.activeCamera = camera;
        scene.activeCamera.attachControl(canvas);
       // scene.useOrderIndependentTransparency = true;
        scene.depthPeelingRenderer.useRenderPasses = true;
        //new BABYLON.PassPostProcess("scale_pass", 5, camera, BABYLON.Texture.LINEAR_LINEAR_MIPNEAREST);
        
       
       //  var defaultPipeline = new BABYLON.DefaultRenderingPipeline("default", false, scene, [scene.activeCamera]);
        
         // defaultPipeline.fxaaEnabled = true;
         
        
        // defaultPipeline.samples = 16
        
        
       
        // var Pipeline = new BABYLON.DefaultRenderingPipeline(
        //     "DefaultRenderingPipeline",
        //     true, // is HDR?
        //     scene,
        //     scene.cameras
        // );
        // Pipeline.samples = 4;
        // Pipeline.imageProcessingEnabled = true;
        // Pipeline.sharpenEnabled = true;
        // Pipeline.sharpen.edgeAmount = 0.2;
        // Pipeline.sharpen.colorAmount = 1;
        // Pipeline.fromLinearSpace=true;
        //new BABYLON.PassPostProcess("scale_pass", 4, camera, BABYLON.Texture.LINEAR_LINEAR_MIPNEAREST);
       




        var hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("img/environment.env", scene);
        hdrTexture.gammaSpace = false;
        //scene.createDefaultSkybox(hdrTexture, true, 10000);//带skybox
         //hdrTexture.rotationY = BABYLON.Tools.ToRadians(0);
        scene.environmentTexture = hdrTexture;//只影响材质，不带skybox
        scene.environmentIntensity = 0.96;

        scene.debugLayer.show(true);


       

        scene.onBeforeRenderObservable.add(function () {
            //console.log("pos:"+camera.position)
            //console.log("tar:"+camera.target)

        });
    }
    const meshes = {};

    //加载模型
    async function loadMeshes() {
        meshes.file = await BABYLON.SceneLoader.AppendAsync("Assets/head.glb");
        console.log("overc:"+meshes.file);   
         
        //A建筑模型
        meshes.faceMesh = scene.getMeshByName("face");
        meshes.browMesh = scene.getMeshByName("brow");
        meshes.eyelashesMesh = scene.getMeshByName("eyelashes");
        meshes.eyesMesh = scene.getMeshByName("eyes");
        meshes.hairMesh = scene.getMeshByName("hair");
        meshes.tearMesh = scene.getMeshByName("tear");
        meshes.hair_inMesh = scene.getMeshByName("hair_in");
        meshes.faceMesh.alphaIndex=0;
        meshes.hair_inMesh.alphaIndex=1;
        meshes.hairMesh.alphaIndex=2;
       
    };

    let loadTexturesAsync = async function () {
        let textures = [];
        return new Promise((resolve, reject) => {
            let textureUrls = [
                "./img/eyes_duf.jpg",
                "./img/eyes_emi.jpg",
              

               
                "./img/face_duf.jpg",
                "./img/face_mnor.jpg",
                "./img/face_nor.jpg",
                "./img/face_art.jpg",

                "./img/tear_nor.jpg",

                "./img/Hair_ao.jpg",
                "./img/Hair_msk.jpg",
               
                
            ];

            for (let url of textureUrls) {
                textures.push(new BABYLON.Texture(url, scene, false, false));
            }
            console.log(textures);
            whenAllReady(textures, () => resolve(textures));
        }).then(() => {
            assignTextures(textures);
        });
    };

    let whenAllReady = function (textures, resolve) {
        let numRemaining = textures.length;
        if (numRemaining == 0) {
            resolve();
            return;
        }

        for (let i = 0; i < textures.length; i++) {
            let texture = textures[i];
            if (texture.isReady()) {
                if (--numRemaining === 0) {
                    resolve();
                    return;
                }
            }
            else {
                let onLoadObservable = texture.onLoadObservable;
                if (onLoadObservable) {
                    onLoadObservable.addOnce(() => {
                        if (--numRemaining === 0) {
                            resolve();
                        }
                    });
                }
            }
        }
    };


    let retrieveTexture = function (meshMat, channel, textures) {

        let texture;
        for (let file of textures) {
            let segment = file.name.split("/");

            if (segment[segment.length - 1].split("_")[0] === meshMat) {

                if (segment[segment.length - 1].split("_")[1] === channel + ".jpg"||segment[segment.length - 1].split("_")[1] === channel + ".png") {

                    texture = file;
                    return texture;
                }
            }
        }
    };

   
    const buildTex = {};
    function assignTextures(textures) {
        buildTex.eyesdufTex = retrieveTexture("eyes", "duf", textures);
        buildTex.eyesemiTex = retrieveTexture("eyes", "emi", textures);
       

      
        buildTex.facedufTex = retrieveTexture("face", "duf", textures);
        buildTex.facemnorTex = retrieveTexture("face", "mnor", textures);
        buildTex.facenorTex = retrieveTexture("face", "nor", textures);
        buildTex.faceartTex = retrieveTexture("face", "art", textures);

        buildTex.tearnorTex = retrieveTexture("tear", "nor", textures);
        
       

        buildTex.HairaoTex = retrieveTexture("Hair", "ao", textures);
        buildTex.HairmskTex = retrieveTexture("Hair", "msk", textures);
        

      
 
    }

    BABYLON.NodeMaterial.IgnoreTexturesAtLoadTime = true;

    const meshesMats = {};
    // const buildParameters = {};
    // const buildParametersb = {};
    async function createMaterials() {
       
        const MatParameters = {};
        // nodePbr material for face
        meshesMats.Mat = new BABYLON.NodeMaterial("mainMatA", scene, {
            emitComments: false
        });
        await meshesMats.Mat.loadAsync("json/Node_sss_face6.json");
        meshesMats.Mat.build(false);
        meshesMats.Mat.needDepthPrePass = true;

        meshes.faceMesh.material = meshesMats.Mat;
        var dufTexture = meshesMats.Mat.getBlockByName("DiffuseTexture");
        var norTexture = meshesMats.Mat.getBlockByName("NormalTexture");
        //var rouTexture = meshesMats.Mat.getBlockByName("roughnessTexture");
        //var thkTexture = meshesMats.Mat.getBlockByName("thincknessTexture");
        var artTexture = meshesMats.Mat.getBlockByName("artTexture");
        dufTexture.texture =  buildTex.facedufTex;
        norTexture.texture =  buildTex.facemnorTex;
        //rouTexture.texture =  buildTex.facerouTex;
        //thkTexture.texture =  buildTex.faceticTex;
        artTexture.texture =  buildTex.faceartTex;

        /************************************************pbrMaterial for eyes*********************************************************************/
        //  meshesMats.eyesMat = new BABYLON.NodeMaterial("eyesMat",scene);
        //  await meshesMats.eyesMat.loadAsync("json/nodeMat_eyes.json");
        //  meshesMats.eyesMat.build(false);
        //  meshesMats.eyesMat.needDepthPrePass = false;//true的话苹果会出现破面
        //  meshesMats.eyesMat.backFaceCulling = true;
         
        meshesMats.eyesMat = new BABYLON.PBRMaterial("eyesMat",scene);
       
        meshesMats.eyesMat.metallic = 0.08;
        meshesMats.eyesMat.roughness = 0;
        meshesMats.eyesMat.indexOfRefraction = 1.8;
        meshesMats.eyesMat.albedoTexture =  buildTex.eyesdufTex;
        meshesMats.eyesMat.emissiveTexture =  buildTex.eyesemiTex;
        meshesMats.eyesMat.emissiveColor = new BABYLON.Color3.FromHexString("#EAD4CD").toLinearSpace();
        meshesMats.eyesMat.albedoColor = new BABYLON.Color3.FromHexString("#F3F0E1").toLinearSpace();


         meshes.eyesMesh.material = meshesMats.eyesMat;




     /************************************************pbrMaterial for tear*********************************************************************/
         meshesMats.tearMat = new BABYLON.PBRMaterial("tearMat",scene);
         //PBRbase
         meshesMats.tearMat.metallic = 0.04;
         meshesMats.tearMat.roughness = 0.36;
         meshesMats.tearMat.indexOfRefraction = 1.34;
         meshesMats.tearMat.environmentIntensity = 0.56;
         meshesMats.tearMat.albedoColor = new BABYLON.Color3.FromHexString("#C98D82").toLinearSpace();
         meshesMats.tearMat.bumpTexture =  buildTex.tearnorTex;
         meshesMats.tearMat.bumpTexture.level = 0.4;
         
         //subSurface

         meshesMats.tearMat.subSurface.diffusionDistance = new BABYLON.Color3(1,0.537,0.537);
         //meshesMats.tearMat.subSurface.scatteringDiffusionProfile = new BABYLON.Color3.FromHexString("#C16767").toLinearSpace();
         meshesMats.tearMat.subSurface.translucencyIntensity=0.9;
 
         meshesMats.tearMat.subSurface.isTranslucencyEnabled = true;
         //meshesMats.tearMat.subSurface.isScatteringEnabled = false;

          meshes.tearMesh.material = meshesMats.tearMat;

     /************************************************standeraterial for fur*********************************************************************/
    //   meshesMats.furMat = new BABYLON.StandardMaterial("furMat",scene);
    //   meshesMats.furMat.diffuseColor = new BABYLON.Color3.FromHexString("#C16767").toLinearSpace();
    //   buildTex.HairmskTex.getAlphaFromRGB = true;
    //   meshesMats.furMat.opacityTexture = buildTex.HairmskTex;





    //   meshes.hair_inMesh.material = meshes.hairMesh.material = meshesMats.furMat;
      
    


    meshesMats.furMat = new BABYLON.PBRMaterial("furMat",scene);
    //PBRbase
  
       
       meshesMats.furMat.metallic = 0;
       meshesMats.furMat.roughness = 0.43;
       meshesMats.furMat.indexOfRefraction = 1.17;
       meshesMats.furMat.metallicF0Factor=0.37;

       //meshesMats.furMat.transparencyMode =3
       meshesMats.furMat.albedoColor = new BABYLON.Color3.FromHexString("#4A142A").toLinearSpace();
      
       meshesMats.furMat.emissiveTexture =  buildTex.HairaoTex;
       meshesMats.furMat.emissiveColor = new BABYLON.Color3.FromHexString("#563330").toLinearSpace();
       buildTex.HairmskTex.getAlphaFromRGB = true;
      

       //meshesMats.furMat.albedoTexture = buildTex.HairmskTexpng;
       meshesMats.furMat.opacityTexture = buildTex.HairmskTex;
     
       meshesMats.furMat.backFaceCulling=false;


       // //buildTex.HairaoTex; 
       // //buildTex.HairdepTex;
      
        meshes.hair_inMesh.material = meshes.hairMesh.material =  meshesMats.furMat;
       


        meshesMats.eyefurMat = new BABYLON.PBRMaterial("eyefurMat",scene);
    //PBRbase
       meshesMats.eyefurMat.metallic = 0.47;
       meshesMats.eyefurMat.roughness = 0.8;
       meshesMats.eyefurMat.indexOfRefraction = 1.24;
 
       meshesMats.eyefurMat.albedoColor = new BABYLON.Color3.FromHexString("#484647").toLinearSpace();
      
       
       //meshesMats.eyefurMat.emissiveColor = new BABYLON.Color3.FromHexString("#563330").toLinearSpace();
      
     
       meshesMats.eyefurMat.backFaceCulling=false;

      
      meshes.browMesh.material = meshes.eyelashesMesh.material = meshesMats.eyefurMat;



     /************************************************NodeMaterial for fur*********************************************************************/
    //  meshesMats.furMat = new BABYLON.NodeMaterial("furMat",scene);
    //  await meshesMats.furMat.loadAsync("json/nodeMat_hair.json");
    
    //     meshesMats.furMat.build(false);
    //     meshesMats.furMat.needDepthPrePass = false;//true的话苹果会出现破面
    //     meshesMats.furMat.backFaceCulling = false;
    //     MatParameters.fuOptTexture = meshesMats.furMat.getBlockByName("hairOtp");
    //     MatParameters.fuOptTexture.texture = buildTex.HairmskTex;
    //     meshes.hair_inMesh.material = meshes.hairMesh.material = meshesMats.furMat;
    /************************************************NodeMaterial for fur*********************************************************************/
       
    
    



        // //获取节点对象
       
         //MatParameters.faceMatTexture = meshesMats.faceMat.AlbedoTexture;
         //MatParameters.eyesDufTexture = meshesMats.eyesMat.getBlockByName("eyesDuf");
        // MatParameters.mainA_NTexture = meshesMats.mainMatA.getBlockByName("NTexture");
        // //LiaoningjianParameters.metallicFloat = meshesMats.overBuildA_qiang.getBlockByName("metallicFloat");
         //MatParameters.roughness = meshesMats.faceMat.metallic;
         //MatParameters.metallic = meshesMats.faceMat.roughness;
       
      


         

         //MatParameters.faceMatTexture.texture = buildTex.facedufTex;
         //MatParameters.eyesDufTexture.texture = buildTex.eyesdufTex;
        // MatParameters.mainA_NTexture.texture = buildTex.mainA_n;



         //MatParameters.roughness = 0.55;
         //MatParameters.metallic = 0.05;

         
    }

    

    
    initScene();
    await loadMeshes();
    await loadTexturesAsync();
    await createMaterials();
    //await createMarble()





    engine.runRenderLoop(function () {
        scene.render();
    });


    // Resize
    window.addEventListener("resize", function () {
        engine.resize();
    });
}