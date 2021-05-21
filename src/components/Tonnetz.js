import React from 'react';
import p5 from 'p5';
import Node from './Node'

class Tonnetz extends React.Component {
    constructor(props) {
      super(props);
      this.myRef = React.createRef("myRef");
      this.state = {
        nodeWidth: 38,
        root: 440,
        genInterval: 9/8,
        perInterval: 25/24,
        activeNode: null
      }
      this.createNodes = this.createNodes.bind(this);
      this.setActiveNode = this.setActiveNode.bind(this);
    }

    createNodes = (p5) => {
       let nodes = [];
       let count = 0;
       
       for (let g=-3; g<4; g++) {
        for (let p=-2; p<3; p++) {
          nodes.push(<Node generator={g} 
                           period={p} 
                           key={count}
                           freq={this.getFreq(g,p)}
                           color={{h:(g+3)/7,
                                   s:1-(p+2)/5,
                                   v:1}}
                           screenPosition={this.getScreenPosition(g,p,this.state.nodeWidth,p5)}/>);
          count++;
        }
       }

       this.setState(() => {
         return {
          nodes: nodes
       }});
    }
  
    Sketch = (p5) => {
        p5.setup = () => {
          p5.createCanvas(p5.windowWidth, p5.windowHeight);
          p5.frameRate(60);
          p5.textAlign(p5.CENTER,p5.CENTER);
          p5.colorMode(p5.HSB,1.0,1.0,1.0);
          p5.background(0,0,0);
          this.createNodes(p5);
        }
        
        p5.draw = () => {
          p5.background(0,0,0);
          let ampWidth = 0;
          for (let i=0; i<this.state.nodes.length; i++) {
            let node = this.state.nodes[i];
            if (this.state.activeNode != null && node.props == this.state.activeNode.props) {
              ampWidth = 30+Math.floor(Math.max(this.props.follower.getValue(),-30));
            } else {
              ampWidth = 0;
            }
            p5.fill(node.props.color.h,node.props.color.s,node.props.color.v);
            p5.ellipse(node.props.screenPosition.x,node.props.screenPosition.y,this.state.nodeWidth + ampWidth,this.state.nodeWidth + ampWidth);
            p5.fill(0);
            p5.text(node.props.generator+','+node.props.period, node.props.screenPosition.x,node.props.screenPosition.y);
          }
          p5.fill(1);
          // console.log(this.props.follower.getValue());
          p5.text(ampWidth,50,10);
        }

        p5.mousePressed = (event) => {
          for (let i=0; i<this.state.nodes.length; i++) {
            const node = this.state.nodes[i];
            if (p5.dist(event.offsetX,event.offsetY,node.props.screenPosition.x,node.props.screenPosition.y) <= this.state.nodeWidth/2) {
              this.playNote(node);
            }
          }
          console.log(this.props.follower);
        }

        p5.windowResized = () => {
          p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
          this.createNodes(p5);
        }

        p5.keyPressed = (event) => {
          console.log("key pressed: "+event.key);
          this.playNote(this.getNodeFromKey(event.key));
        }
    }

    playNote = (node) => {
      console.log("("+node.props.generator + ',' + node.props.period + '): ' + node.props.freq);
      this.setActiveNode(node);
      this.props.player.triggerAttackRelease(node.props.freq, "16n", this.props.Tone.now());
    }

    setActiveNode = (node) => {
      this.setState(() => {
        return {
          activeNode: node
        }
      });
    }

    getNodeFromKey = (key) => {
      //bottom row
      if (key === 'z') {
        return this.state.nodes[1];
      }
      if (key === 'x') {
        return this.state.nodes[6];
      } 
      if (key === 'c') {
        return this.state.nodes[11];
      } 
      if (key === 'v') {
        return this.state.nodes[16];
      } 
      if (key === 'b') {
        return this.state.nodes[21];
      } 
      if (key === 'n') {
        return this.state.nodes[26];
      } 
      if (key === 'm') {
        return this.state.nodes[31];
      }
      
      //middle row
      if (key === 's') {
        return this.state.nodes[2];
      } 
      if (key === 'd') {
        return this.state.nodes[7];
      } 
      if (key === 'f') {
        return this.state.nodes[12];
      } 
      if (key === 'g') {
        return this.state.nodes[17];
      } 
      if (key === 'h') {
        return this.state.nodes[22];
      } 
      if (key === 'j') {
        return this.state.nodes[27];
      } 
      if (key === 'k') {
        return this.state.nodes[32];
      } 

      //top row
      if (key === 'e') {
        return this.state.nodes[3];
      } 
      if (key === 'r') {
        return this.state.nodes[8];
      } 
      if (key === 't') {
        return this.state.nodes[13];
      } 
      if (key === 'y') {
        return this.state.nodes[18];
      } 
      if (key === 'u') {
        return this.state.nodes[23];
      } 
      if (key === 'i') {
        return this.state.nodes[28];
      } 
      if (key === 'o') {
        return this.state.nodes[33];
      }

      return this.state.nodes[0];
    }

    getFreq = (generator,period) => {
      let freq = this.state.root;
      if (generator > 0) {
        for (let g=0; g<generator;g++) {
          freq *= this.state.genInterval;
        }
      } else if (generator < 0) {
        for (let g=generator; g<0;g++) {
          freq /= this.state.genInterval;
        }
      }

      if (period > 0) {
        for (let p=0; p<period;p++) {
          freq *= this.state.perInterval;
        }
      } else if (period < 0) {
        for (let p=period; p<0;p++) {
          freq /= this.state.perInterval;
        }
      }
      
      return freq;
    }
  
    componentDidMount() {
      this.myP5 = new p5(this.Sketch, this.myRef.current);
    }

    getScreenPosition = (gen,per,width,p5) => {
      return {
        x:p5.width/2 + width * (2*gen + per),
        y:p5.height/2 + Math.sqrt(3) * width * -per
      }
    }
  
    render() {
      return (
        <div id="tonnetz-div" ref={this.myRef}/>
      )
    }
}

export default Tonnetz