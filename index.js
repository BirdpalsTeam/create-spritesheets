const fs = require('fs');
const texturePacker = require("free-tex-packer-core");
const resizeOptimizeImages = require('resize-optimize-images');
const trimImage = require('trim-image');
const imagesPath = 'C:/Users/your user/path to your images'; //Path to where are the images you're going to use
const spriteSheetPath = 'C:/Users/your user/path to the where your spritesheet will be created'; //Path to your sprite sheet
const spriteSheetJsonPath = 'C:/Users/your user/path to your json'; //Path to your sprite sheet json
const spritesheetJsonName = 'spritesheet'; //Name of the json you will add information
//for example, spritesheet.json would be the json which the spritesheet data will be added
let dirImages = fs.readdirSync(imagesPath); //Read the data from the directory of your images
let prefix = '';	//The prefix of the images you want to use
let desiredImageName = ''; //The name of the image of the new spritesheet
var totalFiles = 0; //Do not change this
var alreadyTrimmed = 0; //Do not change this

let images = new Array();

const readline1 = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout
});

readline1.question("Prefix of the images you want to use: ", (answer)=>{
	if(typeof answer == "string"){
		prefix = answer;
		readline1.close();
		const readLine2 = require('readline').createInterface({
			input: process.stdin,
			output: process.stdout
		})
		readLine2.question("The sprite sheet name: ", (answer)=>{
			if(typeof answer == "string"){
				desiredImageName = answer;
				readLine2.close();
				resizeAndTrim();
			}
		})
	}
})

function resizeAndTrim(){
	dirImages.filter((file)=>{
		if(file.match(/^\d/)){ //Check if file starts with a number
			if(file.indexOf(`${prefix}.png`) == 1){ //Gets the files that have the prefix wanted
				totalFiles += 1;
			}
		}
	})
	for(let i = 1; i < totalFiles + 1; i++){
		const options = {
			images: [imagesPath + '/' + i  + prefix +'.png'],
			width: 150,
			height: 150,
			quality: 10
		}
		fs.readFile(imagesPath + '/' + i  + prefix +'.png', (err, data) => {
			if (err){
				console.log(err)
			}else{
				resizeOptimizeImages(options).then(()=>{
					console.log(`${i + prefix}.png was resized`);
					images.push({path: i + prefix + ".png", contents: fs.readFileSync(`${imagesPath}` + '/' + i + prefix + ".png")});
					trimImage(`${imagesPath}/${i + prefix}.png`, `${imagesPath}/${i + prefix}.png`, { top: true, right: true, bottom: true, left: true }, (err) => {
						if (err) {
						  console.log(err);
						}else{
							alreadyTrimmed += 1;
							console.log(`${i + prefix}.png was trimmed`);
						}
					});
				}).catch((error)=>{
					console.log(error)
				});
			}
		})
	}
	waitImages();
}
function waitImages(){
	if(alreadyTrimmed < totalFiles){
		setTimeout(waitImages, 1000 / 60);
	}else{
		createImages();
	}
}

function createImages(){
	texturePacker(images, {allowRotation: false, packer: "MaxRectsPacker" , packerMethod: "Smart"}, (files, error) => {
		if (error) {
			console.log(error)
			return;
		} else {  
			for(let item of files) {
				if(item.name.includes('.png')){
					item.name = desiredImageName + '.png';
					fs.writeFile(`${spriteSheetPath}/${item.name}`, item.buffer, function(err) {
						if(err) {
							return console.log(err);
						}
						console.log(`${item.name} was saved at ${spriteSheetPath}`);
					}); 
				}else{
					item.name = desiredImageName + '.json';
					let spriteSheet = JSON.parse(fs.readFileSync(`${spriteSheetJsonPath}/${spritesheetJsonName}.json`));
					spriteSheet[desiredImageName] = JSON.parse(item.buffer.toString());
					fs.writeFile(`${spriteSheetJsonPath}/${spritesheetJsonName}.json`, JSON.stringify(spriteSheet, null, 2), function(err){
						if(err){
							return console.log(err);
						}else{
							console.log(`${desiredImageName} data was saved at ${spriteSheetJsonPath}/${spritesheetJsonName}.json`);
						}
					})
				}
			}
		}
	});
}