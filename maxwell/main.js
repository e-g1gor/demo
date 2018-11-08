/** 2 Pi */
const PI2 = 2 * Math.PI;
/** Visible speed of balls*/
const MODELLING_SPEED = 30;
/** Macro parameters of system */
const BALLS = [
  [100, 15, 0.5, 5], //N, R, V, M
  [0, 20, 0.5, 6]
];
/** Maxwell plot division number */
const N = 50;
/** Canvas enabled */
const CANVAS=iscv();




/** Mechanical system visualisation */
class World {
  /** Create gas visualisation area */
  constructor(steps = 10, name='world', height = 500, width = 500, color = '#EE9') {
    /** canvas */
    this.cv = CANVAS ? document.getElementById(name).getContext('2d', {
      alpha: false
    }) : null;
    /** balls collection */
    this.balls = [];
    this.steps = steps;
    /** world height */
    this.h = height;
    /** world width */
    this.w = width;
    /** backgroung color */
    this.c = color;
    /** get ball info */
    document.getElementById(name).addEventListener("click", (e) => {
    let m = new Ball(1, 0, 0, [e.offsetX, e.offsetY]);
    for (let b of world.balls)
      if (world.collision(m, b)) {
        alert(JSON.stringify(b) + '\n' + world.balls.indexOf(b));
        break;
      }
  });
  }

  /**
   * Add new ball to world
   * @param {number=} radius Ball radius
   * @param {number} velocity Ball velocity value
   * @param {number} mass Ball mass
   * @param {number} max_attempt How long to search vacant position for new ball
   */
  addBall(radius = 20, velocity = 1, mass = 1, max_attempt = 10000) {
    /** new ball */
    let ball = new Ball(radius, velocity, mass);
    while (max_attempt--)
      if (!this.collision(ball, null, false)) {
        this.balls.push(ball);
        return true;
      } else ball = new Ball(radius, velocity, mass);
    return false;
  }

  /**
   * Add some balls to world
   * @param {number} amount amount of new balls to be add
   * @param {number} radius Balls's raduis
   * @param {number} velocity Balls's velocity value
   * @param {number} mass Balls's mass
   */
  addBalls(balls, amount, radius, velocity, mass) {
    if (Array.isArray(balls)) {
      if (Array.isArray(balls[0]))
        for (let b of balls)
          this.addBalls(b);
      else this.addBalls(null, ...balls);
    }
    while (amount--)
      if (!this.addBall(radius, velocity, mass)) {
        alert('Все шары не влезли, осталось ' + amount);
        break;
      }
  }

  /**
   * Check the fact of collision between bals
   * @param {Ball} ball1 First ball
   * @param {Ball} ball2 if undefined, check if ball1 collides with any of balls
   * @returns {Boolean} The fact of collision
   */
  collision(ball1, ball2, movement = true) {
    if (!ball2) {
      for (let ball of this.balls)
        if (this.collision(ball, ball1, movement))
          return true;
      return false;
    }

    if (ball1 === ball2 || v.len(ball1.r, ball2.r) > ball1.R + ball2.R)
      return false;
    if (!movement && v.len(ball1.r, ball2.r) <= ball1.R + ball2.R)
      return true;

    let d = v.sub(ball2.r, ball1.r),
      u1 = v.dir(ball1.v, d, true),
      u2 = v.dir(ball2.v, d, true),
      x1 = u1 > 0,
      x2 = u2 > 0,
      x3 = u2 > u1;
    return (u1 == u2 == 0) && (x2 || !x3 || x1);
  }

  /**
   * Process collisions between all balls
   */
  collide() {
    let ball1 = [];
    let N = this.balls.length;
    for (let i = 0; i < N; i++) {
      ball1.push(this.balls.shift());
      for (let ball2 of this.balls) {
        if (this.collision(ball1[i], ball2)) {
          let n1 = ball1[i].vn(ball2);
          let n2 = ball2.vn(ball1[i]);
          let _n1 = v.mul(
            v.add(
              v.mul(2 * ball2.M, n2),
              v.mul((ball1[i].M - ball2.M), n1)
            ),
            1 / (ball1[i].M + ball2.M)
          );
          let _n2 = v.mul((v.add(v.mul(2 * ball1[i].M, n1), v.mul((ball2.M - ball1[i].M), n2))), 1 / (ball2.M + ball1[i].M));
          ball1[i].v = v.add(ball1[i].v, v.sub(_n1, n1));
          ball2.v = v.add(ball2.v, v.sub(_n2, n2));
        }
      }
    }
    this.balls = ball1;
  }

  /**
   * Get system energy information
   * @param {Boolean=} max if true, returns more detail info (for maxwell distribution calculations)
   * @returns {number|[number,number,number]} Total system energy; maybe also min and max ball energies
   */
  E(array = false) {
    let energy = array ? [] : 0;
    for (let ball of this.balls)
      array ? energy.push(ball.E) : energy += ball.E;
    return energy;
  }

  /** @returns total momentum */
  get P() {
    let p = [0, 0];
    for (let ball of this.balls)
      p = v.add(p, v.mul(ball.M, ball.v));
    return p;
  }

  /**
   * Calculate balls's movement
   * @param {number=} steps amount of steps per function call
   */
  move(steps = this.steps) {
    while (steps--) {
      for (let ball of this.balls) {
        ball.r = v.add(ball.r, ball.v);
        if (ball.r[0] < ball.R || ball.r[0] > this.w - ball.R) {
          ball.r[0] = (ball.r[0] < ball.R) ? ball.R : this.w - ball.R;
          ball.v[0] = -ball.v[0];
        }
        if (ball.r[1] < ball.R || ball.r[1] > world.h - ball.R) {
          ball.r[1] = (ball.r[1] < ball.R) ? ball.R : this.h - ball.R;
          ball.v[1] = -ball.v[1];
        }
      }
      this.collide();
    }
  }

  /**
   * Color all balls
   */
  color() {
    let erel = this.balls.length / this.E();
    for (let i in this.balls)
      this.balls[i].clr(erel);
  }
  /**
   * Render graphics
   */
  start() {
    this.move();
    this.color();
    grafic.maxwell(this.balls);
    this.cv.fillStyle = this.c;
    this.cv.fillRect(0, 0, this.w, this.h);
    for (let b of this.balls) {
      this.cv.fillStyle = b.color;
      this.cv.beginPath();
      this.cv.arc(
        Math.round(b.r[0]),
        Math.round(b.r[1]),
        Math.round(b.R),
        0, PI2);
      this.cv.stroke();
      this.cv.fill();
    }

    // Maxwell
    grafic.cv.fillStyle = '#fff';
    grafic.cv.fillRect(0, 0, grafic.w, grafic.h);
    let d = Math.round(grafic.w / grafic.n);
    for (let i in grafic.cols) {
      grafic.cv.fillStyle = '#34C';
      grafic.cv.fillRect(i * d, grafic.h - grafic.cols[i], d - 2, grafic.cols[i]);
      grafic.cv.stroke();
    }

    // //Momentum
    // if (ei > 300 || ei === null || true) {
    //   ei = 0;
    //   grafic.cv.fillStyle = '#fff';
    //   grafic.cv.fillRect(0, 0, grafic.w, grafic.h);
    //   grafic.cv.beginPath();
    //   grafic.cv.moveTo(50, 50);
    //   grafic.cv.moveTo(50, 70);
    //   grafic.cv.moveTo(150, 50);
    //   grafic.cv.lineTo(...(v.add([150, 50], world.P)));
    //   grafic.cv.stroke();
    // }

    // // Energy
    // grafic.cv.fillStyle = '#34C';
    // grafic.cv.fillRect(ei+1, 0, 1, grafic.h*0.8*world.E()/Etotal);
    // ei++;

    window.requestAnimationFrame(() => {
      this.start();
    });
  }
}


/** Maxwell disstribution plot */
class Plot {
  /**
   * Create new plot area
   * @param {*} h 
   * @param {*} w 
   * @param {*} n 
   */
  constructor(name='plot', h = 100, w = 300, n = N) {
    /** canvas */
    this.cv = CANVAS ? document.getElementById(name).getContext('2d', {
      alpha: false
    }) : null;
    /** world height */
    this.h = h;
    /** world width */
    this.w = w;
    this.cols = [];
    this.N = N;
  }

  /**
   * Maxwell distribution calculating
   * @param {number} n amount of columns 
   */
  maxwell(balls = [], n = this.N) {
    n = 20;
    let e = world.E(true),
      emin = Math.min(...e),
      emax = Math.max(...e),
      estep = (emax) / n,
      EE = Array(n).fill(0);
    //alert(emin + ' '+ emax + ' '+estep);
    this.n = n;
    this.cols = Array(n);
    for (let ball of balls)
      for (let i = 0; i < n; i++) {
        if (ball.E >= i * estep && ball.E < (i + 1) * estep)
          EE[i]++;
      }

    EE.map((e, i) => {
      this.cols[i] = Math.floor(2 * e / emax);
    });
  }
}


/**
 * A number, or a string containing a number.
 * @typedef {[number,number]} Vector 2-dimensional vector
 */
class Vector {
  /**
   * Vector sum
   * @param {Vector} v1
   * @param {Vector} v2
   * @returns {Vector}
   */
  static add(v1, v2) {
    return [v1[0] + v2[0], v1[1] + v2[1]];
  }
  /**
   * Vector substraction
   * @param {Vector} v1 Vector
   * @param {Vector} v2 Vector to be substracted
   * @returns {Vector}
   */
  static sub(v1, v2) {
    return [v1[0] - v2[0], v1[1] - v2[1]];
  }


  /**
   * Vector's dot produt
   * @param {Vector} v1 Vector
   * @param {Vector=} v2 if undefined, considered equal to v1
   * @returns {number}
   */
  static mul(v1, v2) {
    if (v2 === undefined)
      return Vector.mul(v1, v1);
    if (typeof (v1) === 'number')
      return [v1 * v2[0], v1 * v2[1]];
    if (typeof (v2) === 'number')
      return [v1[0] * v2, v1[1] * v2];
    return v1[0] * v2[0] + v1[1] * v2[1];
  }


  /**
   * Vector length 
   * @param {Vector} v1 Vector to be measured, or...
   * @param {Vector=} v2 if defined, measured vector is "v2-v1"
   * @returns {Vector}
   */
  static len(v1, v2) {
    return Math.sqrt(Vector.mul(Vector.sub(v1, v2 ? v2 : [0, 0])));
  }

  /** Unit vector
   * @param {Vector} v1 
   * @returns {Vector} Unit vector, codirectional to original
   */
  static u(v1) {
    return Vector.mul(v1, 1 / Vector.len(v1));
  }

  /**
   * Vector projection on direction
   */
  static dir(v1, dir, scalar = false) {
    let udir = Vector.u(dir);
    return scalar ? Vector.mul(v1, udir) : Vector.mul(Vector.mul(v1, udir), udir);
  }

  /**
   * Vector comparsion
   * @param {Vector} v1 
   * @param {Vector} v2 
   * @returns {Boolean} True, if |v1| > |v2|
   */
  static gt(v1, v2) {
    return ((v1 === 0 ? 0 : Vector.mul(v1)) > (v2 === 0 ? 0 : Vector.mul(v2)));
  }
}
/** Vector pseudonym */
var v = Vector;


class Ball {
  /**
   * Create new ball
   * @param {number} radius Ball radius
   * @param {number} velocity Ball velocity value
   * @param {number} mass Ball mass
   * @param {Vector=} coordinate Ball initial coordinate
   */
  constructor(radius, velocity, mass, coordinate) {
    /** ball coordinates */
    this.r = [
      coordinate ?
      coordinate[0] :
      Math.floor(radius + velocity / 2 + Math.random() * (world.w - 2 * radius - velocity / 2)),
      coordinate ?
      coordinate[1] :
      Math.floor(radius + velocity / 2 + Math.random() * (world.h - 2 * radius - velocity / 2))
    ];
    /** ball velocity */
    Array.isArray(velocity) ?
      this.v = velocity :
      this.v = [
        velocity * (Math.random() - 0.5),
        velocity * (Math.random() - 0.5)
      ];
    /** ball radius */
    this.R = radius;
    /** ball mass */
    this.M = mass;
    /** ball color */
    this.color = '#000';
  }
  /**
   * @returns {number} Ball energy
   */
  get E() {
    return this.M * v.mul(this.v) / 2;
  }
  /**
   * Paint ball to reddish, proportional to energy
   * @param {string=} color Rgb color string
   */
  clr(Erel = 0.01) {
    this.color = '#' + Math.min(Math.round(this.E * Erel * 255 / 2), 255).toString(16) + '0000';
  }
  /**
   * @param {Ball} ball Other ball
   * @returns {Vector} Projection of this ball's velocity to balls's central line
   */
  vn(ball) {
    return v.dir(this.v, v.sub(this.r, ball.r));
  }
}




/**
 * Check whether canvas is enabled
 */
function iscv() {
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
}




var world = new World(MODELLING_SPEED,'world');
world.addBalls(BALLS);

var grafic = new Plot('maxwell');


if (CANVAS) world.start();