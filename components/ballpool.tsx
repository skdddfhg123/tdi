// @react/client
import React, { useEffect, useRef } from 'react';
import Matter, { Engine, Render, Runner, Composite, Composites, Common, MouseConstraint, Mouse, Bodies } from 'matter-js';

const BallPool: React.FC = () => {
  let worldRef: any = useRef(null);
  let mouseConstraint: any = useRef(null);

  useEffect(() => {
    try {
      if (typeof (window as any).MatterWrap !== 'undefined') {
        (Matter as any).use('matter-wrap');
      } else {
        (Matter as any).use(require('matter-wrap'));
      }
    } catch (e) {
      console.error('Failed to load MatterWrap plugin');
    }

    const engine = Engine.create();
    worldRef.current = engine.world;

    const render = Render.create({
      element: document.body,
      engine: engine,
      options: {
        width: 800,
        height: 600,
        showAngleIndicator: true,
        wireframes: false
      },
    });

    Render.run(render);

    const runner = Runner.create();
    Runner.run(runner, engine);

    var offset = 10,
        options = { 
            isStatic: true
        };

    worldRef.bodies = [];

    Composite.add(worldRef.current, [
      // walls
        Bodies.rectangle(400, -offset, 800.5 + 2 * offset, 50.5, options),
        Bodies.rectangle(400, 600 + offset, 800.5 + 2 * offset, 50.5, options),
        Bodies.rectangle(800 + offset, 300, 50.5, 600.5 + 2 * offset, options),
        Bodies.rectangle(-offset, 300, 50.5, 600.5 + 2 * offset, options)
    ]);

    const mouse = Mouse.create(render.canvas);
    mouseConstraint.current = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false,
        },
      },
    });

    Composite.add(worldRef.current, mouseConstraint.current);

    render.mouse = mouse;

    Render.lookAt(render, {
      min: { x: 0, y: 0 },
      max: { x: 800, y: 600 },
    });

    const allBodies = Composite.allBodies(worldRef.current);

    for (let i = 0; i < allBodies.length; i += 1) {
      (allBodies[i] as any).plugin.wrap = {
        min: { x: render.bounds.min.x - 100, y: render.bounds.min.y },
        max: { x: render.bounds.max.x + 100, y: render.bounds.max.y },
      };
    }

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      if (mouseConstraint.current) {
        Composite.remove(worldRef.current, mouseConstraint.current);
      }
    };
  }, []);

  const addBall = () => {
    const newBall = Bodies.circle(400, 0, 46, {
        density: 0.0005,
        frictionAir: 0.02,
        restitution: 0.2,
        friction: 0.01,
        render: {
            sprite: {
                texture: '/ball.png'
            }
        }});
    Composite.add(worldRef.current, newBall);
  };

  const removeBall = () => {
    const balls = Composite.allBodies(worldRef.current).filter(body => body.label === 'Circle Body');
    if (balls.length > 0) {
      Composite.remove(worldRef.current, balls[0]);
    }
  };

  return (
    <div>
      <button onClick={addBall}>Add Ball</button>
      <button onClick={removeBall}>Remove Ball</button>
    </div>
  );
};

export default BallPool;
