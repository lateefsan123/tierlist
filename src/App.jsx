import { useState, useRef, useEffect } from "react";

function App() {
  const initialRows = [
    { item: "S", color: "#FF0055" },
    { item: "A", color: "#00B8FF" },
    { item: "B", color: "#00E676" },
    { item: "C", color: "#FFD500" },
    { item: "D", color: "#FF6B00" },
  ];

  const [row, setRow] = useState(initialRows);
  const [tiers, setTiers] = useState({
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
  });

  const [unranked, setUnranked] = useState(
    Array.from({ length: 26 }, (_, i) => `character${i + 1}`)
  );

  const [color, setColor] = useState("#FF0055");
  const [newrow, Setnewrow] = useState("");
  const [settings, Setsettings] = useState(false);
  const settingsRef = useRef(null);
  const [draggedChar, setDraggedChar] = useState(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (settings && settingsRef.current && !settingsRef.current.contains(e.target)) {
        Setsettings(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [settings]);

  function handleDragStart(e, charId) {
    setDraggedChar(charId);
  }

  function handleDrop(e, tierLabel) {
    e.preventDefault();
    const charId = draggedChar;
    if (!charId || tiers[tierLabel]?.includes(charId)) return;

    setTiers((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((tier) => {
        updated[tier] = updated[tier].filter((id) => id !== charId);
      });
      updated[tierLabel] = [...(updated[tierLabel] || []), charId];
      return updated;
    });

    setUnranked((prev) => prev.filter((id) => id !== charId));
    setDraggedChar(null);
  }

  function handleDropInTier(e, tierLabel, targetCharId) {
    e.preventDefault();
    if (!draggedChar || draggedChar === targetCharId) return;

    setTiers((prev) => {
      const updatedTier = [...prev[tierLabel]];
      const fromIndex = updatedTier.indexOf(draggedChar);
      const toIndex = updatedTier.indexOf(targetCharId);

      if (fromIndex > -1 && toIndex > -1) {
        updatedTier.splice(fromIndex, 1);
        updatedTier.splice(toIndex, 0, draggedChar);
      }

      return {
        ...prev,
        [tierLabel]: updatedTier,
      };
    });

    setDraggedChar(null);
  }

  function allowDrop(e) {
    e.preventDefault();
  }

  function add() {
    const trimmed = newrow.trim().toUpperCase();
    if (!trimmed || tiers[trimmed]) return;

    setRow([...row, { item: trimmed, color }]);
    setTiers({ ...tiers, [trimmed]: [] });
    Setnewrow("");
    Setsettings(false);
  }

  function deleteRow(index) {
    const label = row[index].item;
    const chars = tiers[label] || [];
    setUnranked([...unranked, ...chars]);

    const updatedRow = row.filter((_, i) => i !== index);
    setRow(updatedRow);

    const updatedTiers = { ...tiers };
    delete updatedTiers[label];
    setTiers(updatedTiers);
  }

  return (
    <div className="body">
      <div className="header">
        <h3 className="title">Tier List Maker</h3>
        <button className="add-button" onClick={() => Setsettings(true)}>+ Add Tier</button>
      </div>

      <div className="maincontent">
        {row.map((tier, i) => {
          const tierLabel = tier.item;
          const tierColor = tier.color;
          const tierList = tiers[tierLabel] || [];

          return (
            <div
              key={i}
              className="item"
              onDrop={(e) => handleDrop(e, tierLabel)}
              onDragOver={allowDrop}
            >
              <div className="name" style={{ backgroundColor: tierColor }}>
                {tierLabel}
              </div>
              <div className="middle">
                {tierList.map((charId, idx) => (
                  <div
                    key={idx}
                    className={`char ${charId}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, charId)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDropInTier(e, tierLabel, charId)}
                  ></div>
                ))}
              </div>
              <div className="right">
                <button onClick={() => deleteRow(i)}>✕</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="characters">
        {unranked.map((charId, i) => (
          <div
            key={i}
            className={`char ${charId}`}
            draggable
            onDragStart={(e) => handleDragStart(e, charId)}
          ></div>
        ))}
      </div>

      {settings && (
        <div className="showsettings" ref={settingsRef}>
          <div className="colour">
            {["#FF0055", "#FF6B00", "#FFD500", "#00E676", "#00B8FF",
              "#A94BFF", "#FF61C3", "#00F0FF", "#FFF685", "#444AFF"
            ].map((clr, i) => (
              <div
                key={i}
                className="colours"
                style={{ backgroundColor: clr }}
                onClick={() => setColor(clr)}
              ></div>
            ))}
          </div>
          <div className="names">
            <input
              type="text"
              value={newrow}
              onChange={(e) => Setnewrow(e.target.value)}
              placeholder="Tier name"
            />
          </div>
          <div className="end">
            <button onClick={add}>Add Row</button>
          </div>
        </div>
      )}

      <button className="to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>

    </div>
  );
}

export default App;
