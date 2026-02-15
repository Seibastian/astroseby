import { useMemo } from "react";

const SporeField = () => {
  const spores = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 2,
      duration: `${Math.random() * 5 + 3}s`,
      delay: `${Math.random() * 6}s`,
    }));
  }, []);

  return (
    <>
      <div className="mycelium-bg" />
      <div className="star-field">
        {spores.map((spore) => (
          <div
            key={spore.id}
            className="star"
            style={{
              left: spore.left,
              top: spore.top,
              width: `${spore.size}px`,
              height: `${spore.size}px`,
              "--duration": spore.duration,
              "--delay": spore.delay,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </>
  );
};

export default SporeField;
