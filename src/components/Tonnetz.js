import React from 'react';
import p5 from 'p5';
import Voronoi from 'voronoi';

class Tonnetz extends React.Component {
    constructor(props) {
      super(props);
      this.myRef = React.createRef("myRef");
      this.state = {
        nodeWidth: 38,
        root: 440,
        genInterval: 3/2,
        perInterval: 5/4
      }
      this.createNodes = this.createNodes.bind(this);
      this.getSitesFromNodes = this.getSitesFromNodes.bind(this);
    }

    createVoronoi = (p5) => {
      this.voronoi = {};
      this.voronoi.obj = new Voronoi();
      this.voronoi.bbox = {xl: 0, xr: p5.width, yt: 0, yb: p5.height}; // xl is x-left, xr is x-right, yt is y-top, and yb is y-bottom
      this.voronoi.sites = this.getSitesFromNodes();
      this.voronoi.diagram = this.voronoi.obj.compute(this.voronoi.sites, this.voronoi.bbox);
      for (let i=0; i < this.state.nodes.length; i++) {
        let node = this.state.nodes[i];
        for (let j=0; j< this.voronoi.diagram.cells.length; j++) {
          const cell = this.voronoi.diagram.cells[j];
          if (Math.floor(cell.site.x) === Math.floor(node.screenPosition.x) && Math.floor(cell.site.y) === Math.floor(node.screenPosition.y)) {
            node.setCell(cell);
          }
        }
      }
    }

    drawVoronoi = (p5) => {
      p5.stroke(1);
      const edges = this.voronoi.diagram.edges;
      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        p5.line(edge.va.x,edge.va.y,edge.vb.x,edge.vb.y);
      }
    }

    getSitesFromNodes = () => {
      let sites = [];
      for (let i = 0; i < this.state.nodes.length; i++) {
        sites.push({
          x: this.state.nodes[i].screenPosition.x,
          y: this.state.nodes[i].screenPosition.y
        })
      }

      return sites;
    }

    createNodes = (p5) => {
      let nodes = [];
      
      for (let g=-3; g<4; g++) {
       for (let p=-2; p<3; p++) {
         nodes.push(
           new Node(g,p,
                    this.getFreq(g,p,this.state.root),
                    {h:(g+3)/7,s:1-(p+2)/5,v:1},
                    this.getScreenPosition(g,p,this.state.nodeWidth,p5)));
       }
      }

      this.setState(() => {
        return {
          nodes: nodes
        }
      });
    }

    drawCell = (p5,cell) => {
      p5.beginShape();
      for (let i=0; i< cell.halfedges.length; i++) {
        const halfEdgeStart = cell.halfedges[i].getStartpoint();
        p5.vertex(halfEdgeStart.x,halfEdgeStart.y);
      }
      p5.endShape();
    }
  
    Sketch = (p5) => {
        p5.setup = () => {
          p5.createCanvas(p5.windowWidth, p5.windowHeight);
          p5.frameRate(60);
          p5.textAlign(p5.CENTER,p5.CENTER);
          p5.colorMode(p5.HSB,1.0,1.0,1.0);
          p5.background(0,0,0);
          this.createNodes(p5);
          this.createVoronoi(p5);
        }
        
        p5.draw = () => {
          p5.background(0,0,0);

          // let ampWidth = 0;
          for (let i=0; i<this.state.nodes.length; i++) {
            let node = this.state.nodes[i];
            // ampWidth = 30+Math.floor(Math.max(this.props.follower.getValue(),-30));
            // if (node.active) {
            // } else {
            //   ampWidth = 0;
            // }
            // p5.ellipse(node.screenPosition.x,node.screenPosition.y,this.state.nodeWidth + ampWidth,this.state.nodeWidth + ampWidth);

            if (node.active) {
              p5.fill(node.color.h,node.color.s,node.color.v,1);
            } else {
              p5.fill(node.color.h,node.color.s,node.color.v,0.7);
            }

            this.drawCell(p5,node.cell);

            // p5.fill(1);
            // p5.text(node.generator+','+node.period, node.screenPosition.x,node.screenPosition.y);
          }

          this.drawVoronoi(p5);
          p5.noStroke();

          p5.fill(1);
          for (let t=0; t<p5.touches.length; t++) {
            for (let i=0; i<this.state.nodes.length; i++) {
              const touch = p5.touches[t];
              const node = this.state.nodes[i];
              if (p5.dist(touch.x,touch.y,node.screenPosition.x,node.screenPosition.y) <= this.state.nodeWidth/2) {
                this.playNote(node);
              }
            }
          }
        }

        p5.mousePressed = (event) => {
          for (let i=0; i<this.state.nodes.length; i++) {
            const node = this.state.nodes[i];
            if (p5.dist(event.offsetX,event.offsetY,node.screenPosition.x,node.screenPosition.y) <= this.state.nodeWidth/1.5) {
              this.playNote(node);
            }
          }
        }

        p5.windowResized = () => {
          p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
          this.createNodes(p5);
          this.createVoronoi(p5);
        }

        p5.keyPressed = (event) => {
          this.playNote(this.getNodeFromKey(event.key,this.checkShifter(p5,event.keyCode)));
        }

    }

    checkShifter = (p5,keyCode) => {
      if (p5.keyIsDown(32)) {
        return -1;
      }
      if (p5.keyIsDown(p5.SHIFT)) {
        return 1;
      }
      return 0;
    }

    playNote = (node) => {
      if (node !== null && !node.active) {
        this.props.player.triggerAttackRelease(node.freq, "8n", this.props.Tone.now());
        node.setActive();
      }
    }

    getNodeFromKey = (key,shifter) => {
      //bottom row
      key = key.toLowerCase();
      if (key === 'z') {
        return this.state.nodes[1+shifter];
      }
      if (key === 'x') {
        return this.state.nodes[6+shifter];
      } 
      if (key === 'c') {
        return this.state.nodes[11+shifter];
      } 
      if (key === 'v') {
        return this.state.nodes[16+shifter];
      } 
      if (key === 'b') {
        return this.state.nodes[21+shifter];
      } 
      if (key === 'n') {
        return this.state.nodes[26+shifter];
      } 
      if (key === 'm') {
        return this.state.nodes[31+shifter];
      }
      
      //middle row
      if (key === 's') {
        return this.state.nodes[2+shifter];
      } 
      if (key === 'd') {
        return this.state.nodes[7+shifter];
      } 
      if (key === 'f') {
        return this.state.nodes[12+shifter];
      } 
      if (key === 'g') {
        return this.state.nodes[17+shifter];
      } 
      if (key === 'h') {
        return this.state.nodes[22+shifter];
      } 
      if (key === 'j') {
        return this.state.nodes[27+shifter];
      } 
      if (key === 'k') {
        return this.state.nodes[32+shifter];
      } 

      //top row
      if (key === 'e') {
        return this.state.nodes[3+shifter];
      } 
      if (key === 'r') {
        return this.state.nodes[8+shifter];
      } 
      if (key === 't') {
        return this.state.nodes[13+shifter];
      } 
      if (key === 'y') {
        return this.state.nodes[18+shifter];
      } 
      if (key === 'u') {
        return this.state.nodes[23+shifter];
      } 
      if (key === 'i') {
        return this.state.nodes[28+shifter];
      } 
      if (key === 'o') {
        return this.state.nodes[33+shifter];
      }

      return null;
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

class Node {
  constructor(generator,period,freq,color,screenPosition) {
    this.generator = generator;
    this.period = period;
    this.color = color;
    this.freq = freq;
    this.screenPosition = screenPosition;
    this.active = false;
    this.cell = null;
  }

  setActive = () => {
    this.active = true;

    setTimeout(() => {
      this.active = false
    }, 200);
  }

  setCell = (cell) => {
    this.cell = cell;
  }
}

export default Tonnetz