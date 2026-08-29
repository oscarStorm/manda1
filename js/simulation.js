(() => {
  class Vector {
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }

    copy() {
      return new Vector(this.x, this.y);
    }

    add(vector) {
      this.x += vector.x;
      this.y += vector.y;
      return this;
    }

    mult(value) {
      this.x *= value;
      this.y *= value;
      return this;
    }

    mag() {
      return Math.hypot(this.x, this.y);
    }

    heading() {
      return Math.atan2(this.y, this.x);
    }

    limit(max) {
      if (this.mag() > max) {
        this.setMag(max);
      }
      return this;
    }

    setMag(value) {
      const current = this.mag();
      if (current === 0) {
        return this;
      }

      this.x = (this.x / current) * value;
      this.y = (this.y / current) * value;
      return this;
    }

    static add(a, b) {
      return new Vector(a.x + b.x, a.y + b.y);
    }

    static sub(a, b) {
      return new Vector(a.x - b.x, a.y - b.y);
    }

    static fromAngle(angle, mag) {
      return new Vector(Math.cos(angle) * mag, Math.sin(angle) * mag);
    }
  }

  function angleDifference(a, b) {
    let diff = a - b;

    while (diff > Math.PI) {
      diff -= Math.PI * 2;
    }

    while (diff < -Math.PI) {
      diff += Math.PI * 2;
    }

    return diff;
  }

  class Particle {
    constructor(width, height) {
      this.pos = new Vector(Math.random() * width, Math.random() * height);
      this.vel = new Vector(3, 3);
      this.acc = new Vector(2, 3);
      this.diam = 10;
    }

    display(ctx) {
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.diam / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    update(frameScale) {
      const maxSpeed = 6;
      const maxTurn = 0.04 * frameScale;
      const scaledAcceleration = this.acc.copy().mult(frameScale);
      const desiredVel = this.vel.copy().add(scaledAcceleration);
      const currentAngle = this.vel.heading();
      const desiredAngle = desiredVel.heading();
      const turn = angleDifference(desiredAngle, currentAngle);
      const clampedTurn = Math.max(-maxTurn, Math.min(maxTurn, turn));
      const newAngle = currentAngle + clampedTurn;

      this.vel = Vector.fromAngle(newAngle, desiredVel.mag());
      this.vel.limit(maxSpeed);
      this.pos.add(this.vel.copy().mult(frameScale));
      this.acc.mult(0);
    }

    avoidEdges(width, height) {
      const margin = 160;
      const turnStrength = 0.35;

      if (this.pos.x < margin) {
        this.acc.x += turnStrength;
      }

      if (this.pos.x > width - margin) {
        this.acc.x -= turnStrength;
      }

      if (this.pos.y < margin) {
        this.acc.y += turnStrength;
      }

      if (this.pos.y > height - margin) {
        this.acc.y -= turnStrength;
      }
    }
    /*
    edges(width, height) {
      if (this.pos.x <= 0 || this.pos.x >= width) {
        this.vel.x *= -1;
      }
  
      if (this.pos.y <= 0 || this.pos.y >= height) {
        this.vel.y *= -1;
      }
    }
    */
  }

  class Joint {
    constructor(x, y, distance) {
      this.pos = new Vector(x, y);
      this.dist = distance;
    }
  }

  class Limb {
    constructor(root, width, height) {
      this.segments = [];
      this.numJoints = 12;
      this.target = root.copy();
      this.root = root;

      let sum = 0;
      let segmentLength = 15;

      for (let i = 0; i < this.numJoints; i += 1) {
        this.segments.push(new Joint(width / 2, height - sum, segmentLength));
        sum += segmentLength;
        segmentLength *= 1.2;
      }
    }

    display(ctx) {
      //ctx.strokeStyle = "rgb(0, 0, 0)";
      ctx.fillStyle = "rgb(230, 238, 214)";
      ctx.lineWidth = 4;

      for (let i = 0; i < this.segments.length - 1; i += 1) {
        const current = this.segments[i].pos;
        const next = this.segments[i + 1].pos;

        ctx.beginPath();
        ctx.moveTo(current.x, current.y);
        ctx.lineTo(next.x, next.y);
        //ctx.stroke();
      }

      for (let i = 0; i < this.segments.length; i += 1) {
        const joint = this.segments[i];
        const stepsFromHead = this.segments.length - 1 - i;
        const radius = 60 * (0.85 ** stepsFromHead);
        this.drawJoint(ctx, joint.pos, radius);
      }
    }

    drawJoint(ctx, pos, radius) {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();
      //ctx.stroke();
    }

    update() {
      this.fabrikForward();
    }

    fabrikForward() {
      let next = this.segments[this.segments.length - 1];
      next.pos = this.target.copy();

      for (let i = this.segments.length - 2; i >= 0; i -= 1) {
        const current = this.segments[i];
        const direction = Vector.sub(next.pos, current.pos);
        direction.setMag(current.dist);
        current.pos = Vector.sub(next.pos, direction);
        next = current;
      }
    }

    fabrikBackward() {
      let previous = this.segments[0];
      previous.pos = this.root.copy();

      for (let i = 1; i < this.segments.length; i += 1) {
        const current = this.segments[i];
        const direction = Vector.sub(current.pos, previous.pos);
        direction.setMag(previous.dist);
        current.pos = Vector.add(previous.pos, direction);
        previous = current;
      }
    }
  }

  const canvas = document.getElementById("simulation-canvas");
  const ctx = canvas.getContext("2d");

  let width = 0;
  let height = 0;
  let limb;
  let particle;
  let lastFrameTime = null;
  let animationFrameId = null;
  let isRunning = false;

  function resizeCanvas() {
    const pixelRatio = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function setup() {
    resizeCanvas();
    const origin = new Vector(width / 2, height);
    limb = new Limb(origin, width, height);
    particle = new Particle(width, height);
  }

  function drawBackground() {
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, width, height);
  }

  function draw(timestamp) {
    if (!isRunning) {
      return;
    }

    animationFrameId = requestAnimationFrame(draw);

    if (lastFrameTime === null) {
      lastFrameTime = timestamp;
      return;
    }

    const deltaSeconds = Math.min((timestamp - lastFrameTime) / 1000, 1 / 30);
    const frameScale = deltaSeconds * 60;
    lastFrameTime = timestamp;

    particle.avoidEdges(width, height);
    particle.update(frameScale);

    limb.target = particle.pos.copy();
    limb.update();
    drawBackground();
    limb.display(ctx);
    //particle.display(ctx);
  }

  function handleResize() {
    if (isRunning) {
      setup();
    }
  }

  function start() {
    if (isRunning) {
      return;
    }

    isRunning = true;
    lastFrameTime = null;
    setup();
    window.addEventListener("resize", handleResize);
    animationFrameId = requestAnimationFrame(draw);
  }

  function stop() {
    isRunning = false;
    window.removeEventListener("resize", handleResize);

    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  window.limbSimulation = {
    start,
    stop
  };
})();
