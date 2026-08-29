(() => {
class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    static random2D() {
        const angle = Math.random() * Math.PI * 2;

        return new Vector(
            Math.cos(angle),
            Math.sin(angle)
        );
    }

    static subtract(first, second) {
        return new Vector(
            first.x - second.x,
            first.y - second.y
        );
    }

    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }

      subtract(vector) {
          this.x -= vector.x;
          this.y -= vector.y;
          return this;
      }

      multiply(value) {
          this.x *= value;
          this.y *= value;
          return this;
      }

      divide(value) {
          if (value !== 0) {
              this.x /= value;
              this.y /= value;
          }

          return this;
      }

      magnitude() {
          return Math.hypot(this.x, this.y);
      }

      setMagnitude(value) {
          const magnitude = this.magnitude();

          if (magnitude !== 0) {
              this.multiply(value / magnitude);
          }

          return this;
      }

      limit(maximum) {
          if (this.magnitude() > maximum) {
              this.setMagnitude(maximum);
          }

          return this;
      }

      set(x, y) {
          this.x = x;
          this.y = y;
          return this;
      }
  }

  class Boid {
      constructor(canvas) {
          this.canvas = canvas;

          this.position = new Vector(
              Math.random() * canvas.width,
              Math.random() * canvas.height
          );

          this.velocity = Vector.random2D();
          this.velocity.setMagnitude(randomBetween(1, 2));

          this.acceleration = new Vector();

          this.maxForce = 0.2;
          this.maxSpeed = 3;
      }

      edges() {
          if (this.position.x > this.canvas.width) {
              this.position.x = 0;
          } else if (this.position.x < 0) {
              this.position.x = this.canvas.width;
          }

          if (this.position.y > this.canvas.height) {
              this.position.y = 0;
          } else if (this.position.y < 0) {
              this.position.y = this.canvas.height;
          }
      }

      align(boids) {
          const visionRadius = 90;
          const steering = new Vector();
          let total = 0;

          for (const other of boids) {
              const distance = distanceBetween(
                  this.position,
                  other.position
              );

              if (
                  other !== this &&
                  distance < visionRadius
              ) {
                  steering.add(other.velocity);
                  total++;
              }
          }

          if (total > 0) {
              steering.divide(total);
              steering.setMagnitude(this.maxSpeed);
              steering.subtract(this.velocity);
              steering.limit(this.maxForce);
          }

          return steering;
      }

      separation(boids) {
          const visionRadius = 35;
          const steering = new Vector();
          let total = 0;

          for (const other of boids) {
              const distance = distanceBetween(
                  this.position,
                  other.position
              );

              if (
                  other !== this &&
                  distance > 0 &&
                  distance < visionRadius
              ) {
                  const difference = Vector.subtract(
                      this.position,
                      other.position
                  );

                  difference.divide(distance * distance);

                  steering.add(difference);
                  total++;
              }
          }

          if (total > 0) {
              steering.divide(total);
              steering.setMagnitude(this.maxSpeed);
              steering.subtract(this.velocity);
              steering.limit(this.maxForce);
          }

          return steering;
      }

      cohesion(boids) {
          const visionRadius = 120;
          const steering = new Vector();
          let total = 0;

          for (const other of boids) {
              const distance = distanceBetween(
                  this.position,
                  other.position
              );

              if (
                  other !== this &&
                  distance < visionRadius
              ) {
                  steering.add(other.position);
                  total++;
              }
          }

          if (total > 0) {
              steering.divide(total);
              steering.subtract(this.position);
              steering.setMagnitude(this.maxSpeed);
              steering.subtract(this.velocity);
              steering.limit(this.maxForce);
          }

          return steering;
      }

      flock(
          boids,
          separationWeight,
          alignmentWeight,
          cohesionWeight
      ) {
          const separation = this.separation(boids);
          const alignment = this.align(boids);
          const cohesion = this.cohesion(boids);

          separation.multiply(separationWeight);
          alignment.multiply(alignmentWeight);
          cohesion.multiply(cohesionWeight);

          this.acceleration.add(separation);
          this.acceleration.add(alignment);
          this.acceleration.add(cohesion);
      }

      update(frameScale) {
          this.velocity.x += this.acceleration.x * frameScale;
          this.velocity.y += this.acceleration.y * frameScale;
          this.velocity.limit(this.maxSpeed);

          this.position.x += this.velocity.x * frameScale;
          this.position.y += this.velocity.y * frameScale;

          this.acceleration.set(0, 0);
      }

      show(context) {
          context.beginPath();

          context.arc(
              this.position.x,
              this.position.y,
              8,
              0,
              Math.PI * 2
          );

          context.fillStyle = "white";
          context.fill();
      }
  }

  function randomBetween(minimum, maximum) {
      return (
          Math.random() * (maximum - minimum) +
          minimum
      );
  }

  function distanceBetween(first, second) {
      return Math.hypot(
          first.x - second.x,
          first.y - second.y
      );
  }

  const canvas = document.querySelector("#boid-canvas");
  const context = canvas.getContext("2d");

  const separationSlider =
      document.querySelector("#separation");

  const alignmentSlider =
      document.querySelector("#alignment");

  const cohesionSlider =
      document.querySelector("#cohesion");

  const separationValue =
      document.querySelector("#separation-value");

  const alignmentValue =
      document.querySelector("#alignment-value");

  const cohesionValue =
      document.querySelector("#cohesion-value");

  const boids = [];
  const boidCount = 100;
  let lastFrameTime = null;
  let animationFrameId = null;
  let isRunning = false;

  function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
  }

  function updateSliderValue(slider, output) {
      output.textContent = slider.value;
  }

  separationSlider.addEventListener("input", () => {
      updateSliderValue(
          separationSlider,
          separationValue
      );
  });

  alignmentSlider.addEventListener("input", () => {
      updateSliderValue(
          alignmentSlider,
          alignmentValue
      );
  });

  cohesionSlider.addEventListener("input", () => {
      updateSliderValue(
          cohesionSlider,
          cohesionValue
      );
  });

  window.addEventListener("resize", resizeCanvas);

  resizeCanvas();

  for (let index = 0; index < boidCount; index++) {
      boids.push(new Boid(canvas));
  }

  function animate(timestamp) {
      if (!isRunning) {
          return;
      }

      animationFrameId = requestAnimationFrame(animate);

      if (lastFrameTime === null) {
          lastFrameTime = timestamp;
          return;
      }

      const deltaSeconds = Math.min(
          (timestamp - lastFrameTime) / 1000,
          1 / 30
      );
      const frameScale = deltaSeconds * 60;
      lastFrameTime = timestamp;

      context.fillStyle = "black";
      context.fillRect(
          0,
          0,
          canvas.width,
          canvas.height
      );

      const separationWeight =
          Number(separationSlider.value);

      const alignmentWeight =
          Number(alignmentSlider.value);

      const cohesionWeight =
          Number(cohesionSlider.value);

      for (const boid of boids) {
          boid.edges();

          boid.flock(
              boids,
              separationWeight,
              alignmentWeight,
              cohesionWeight
          );

          boid.update(frameScale);
          boid.show(context);
      }
  }

  function start() {
      if (isRunning) {
          return;
      }

      isRunning = true;
      lastFrameTime = null;
      resizeCanvas();

      if (boids.length === 0) {
          for (let index = 0; index < boidCount; index++) {
              boids.push(new Boid(canvas));
          }
      }

      animationFrameId = requestAnimationFrame(animate);
  }

  function stop() {
      isRunning = false;

      if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
      }
  }

  window.boidsSimulation = {
      start,
      stop
  };
})();
