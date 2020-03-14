import React from "react";
import ReactDOM from "react-dom";
import FileBase64 from 'react-file-base64';
import { Base64 } from 'js-base64';

export default class App extends React.Component {
	constructor(props){
		super(props);
		
		this.state = { 
			identifedAs: '',
			files: '',
			image: null
		};
	}

	getFiles(files){
	    this.setState({ files: files })
	    let base64 = this.state.files[0].base64;

	    this.identifyImage(base64);
	  }

	identifyImage (picture) {
		const Clarifai = require('clarifai');

		const clarifaiApp = new Clarifai.App({
			apiKey: 'ba7fec128a0243c18186d47d861edb35'
		});

		const pictureBase64 = picture.split(',')[1];

		clarifaiApp.models.predict(Clarifai.GENERAL_MODEL, {base64: pictureBase64})
			.then((response) => {
	        let concepts = response['outputs'][0]['data']['concepts']
	        console.log(concepts)

	        this.checkIfGolfBallExist(concepts, pictureBase64, picture);
	      })
			.catch((err) => console.log(err))
	  }

	  checkIfGolfBallExist (concepts, pictureBase64, picture) {
	  	for (let i=0; i < concepts.length; i++) {
			if (concepts[i].name !== "ball") {
				continue;
			}
			
			this.drawImage(pictureBase64, picture);
			this.drawTheCanvas(pictureBase64, picture);
			return;
        }
        alert('Cannot detect a golf ball in your image');
	  }

	  drawImage (photo, picture) {
	  	const base64 = Base64.atob(photo);

	  	this.setState({ image: picture})
	  }

	  drawTheCanvas (photo, picture) {
	  	const base64 = Base64.atob(photo);
	  	const canvas = document.getElementById('uploadedImageCanvas');
		const ctx = canvas.getContext('2d');
		const image = new Image();

		image.onload = function() {
		  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
		  let myData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		  let pixelColors = [];
		  let rownNumber = 0;
		  let columnNumber = 0;
		  for (let i=0; i<myData.data.length; i+=4) {
			  let red = myData.data[i];
			  let green = myData.data[i+1];
			  let blue = myData.data[i+2];
			  let alpha = myData.data[i+3]/255;

			  if (i % (canvas.width*4) === 0) {
	      		rownNumber++;
	      	  }
	      	  if (i % (canvas.width*4) !== 0) {
	      		columnNumber++;
	      	  } else { columnNumber = 1; }

			  pixelColors.push({'row':rownNumber,'column': columnNumber,'red': red,'green': green,'blue': blue,'alpha': alpha});
		  }
	      console.log(pixelColors);
	      console.log(canvas.width);
	      // for(let i=0; i<pixelColors.length; i++){
	      // 	console.log(i[0])
	      // 	let bottomPix = i.row + 1;
	      // 	let rightPix = i.column + 1;
	      // 	if (pixelColors[bottomPix].red - i.red > 20) {
	      // 		console.log(pixelColors[bottomPix].row + ',' + pixelColors[bottomPix].column)
	      // 	}
	      // 	if (pixelColors[rightPix].red - i.red > 20) {
	      // 		console.log(pixelColors[rightPix].row + ',' + pixelColors[rightPix].column)
	      // 	}
	      // }
		};
		image.src = picture;
	  }

	render () {
		return (
			<div>
	            <FileBase64
			        multiple={ true }
			        onDone={ this.getFiles.bind(this) } />
			    { this.state.image &&
			    	<div>
			    		<canvas id='uploadedImageCanvas' style={{width:'1000px',height:'100%',display:'none'}}></canvas>
			    		<img src={`${this.state.image}`} alt='' style={{width:'100%'}} />
			    	</div>
			    }
			</div>
		)
	}

}


ReactDOM.render(<App />, document.getElementById("image-sizer-app"));