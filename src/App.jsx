import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import { motion, AnimatePresence } from "framer-motion"; // bringing in motion & AnimatePresence

function App() {
  // snapshot button - captures a screenshot of the main content div
  function handleSnapshot() {
    const tierlist = document.querySelector(".maincontent");
    if (!tierlist) return;

    html2canvas(tierlist).then((canvas) => {
      const link = document.createElement("a");
      link.download = "tierlist.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  }

  // default rows
  const initialRows = [
    { item: "S", color: "#FF0055" },
    { item: "A", color: "#00B8FF" },
    { item: "B", color: "#00E676" },
    { item: "C", color: "#FFD500" },
    { item: "D", color: "#FF6B00" },
  ];

  const [editingTier, setEditingTier] = useState(null);
  const [editedTierName, setEditedTierName] = useState("");

  const [row, setRow] = useState(initialRows);
  const [tiers, setTiers] = useState({
    S: [], A: [], B: [], C: [], D: [],
  });

  const [unranked, setUnranked] = useState(
    Array.from({ length: 26 }, (_, i) => `character${i + 1}`)
  );

  const [color, setColor] = useState("#FF0055");
  const [newrow, Setnewrow] = useState("");
  const [settings, Setsettings] = useState(false);
  const settingsRef = useRef(null);
  const [draggedChar, setDraggedChar] = useState(null);

  // inline tier name editing logic
  function startEditing(index, currentName) {
    setEditingTier(index);
    setEditedTierName(currentName);
  }

  function finishEditing(index) {
    if (!editedTierName.trim()) {
      setEditingTier(null);
      return;
    }

    const newLabel = editedTierName.trim().toUpperCase();
    const oldLabel = row[index].item;

    const updatedRow = [...row];
    updatedRow[index].item = newLabel;

    const updatedTiers = { ...tiers };
    updatedTiers[newLabel] = updatedTiers[oldLabel] || [];
    delete updatedTiers[oldLabel];

    setRow(updatedRow);
    setTiers(updatedTiers);
    setEditingTier(null);
  }

  // auto-close settings box when clicking outside of it
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        settings &&
        settingsRef.current &&
        !settingsRef.current.contains(e.target)
      ) {
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
        <button className="add-button" onClick={() => Setsettings(true)}>
          + Add Tier
        </button>
        <button className="snapshot-button" onClick={handleSnapshot}>
          <i className="fa-solid fa-camera"></i>
        </button>
      </div>

      <div className="maincontent">
        {row.map((tier, i) => {
          const tierLabel = tier.item;
          const tierColor = tier.color;
          const tierList = tiers[tierLabel] || [];

          return (
            <motion.div
              key={i}
              className="item"
              onDrop={(e) => handleDrop(e, tierLabel)}
              onDragOver={allowDrop}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="name" style={{ backgroundColor: tierColor }}>
                {editingTier === i ? (
                  <input
                    type="text"
                    value={editedTierName}
                    onChange={(e) => setEditedTierName(e.target.value)}
                    onBlur={() => finishEditing(i)}
                    onKeyDown={(e) => e.key === "Enter" && finishEditing(i)}
                    autoFocus
                  />
                ) : (
                  <span onClick={() => startEditing(i, tierLabel)}>{tierLabel}</span>
                )}
              </div>

              <div className="middle">
                {tierList.map((charId, idx) => (
                  <motion.div
                    key={idx}
                    className={`char ${charId}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, charId)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDropInTier(e, tierLabel, charId)}
                    whileDrag={{ scale: 1.2, zIndex: 999 }}
                  />
                ))}
              </div>

              <div className="right">
                <button onClick={() => deleteRow(i)}>✕</button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="characters">
        {unranked.map((charId, i) => (
          <motion.div
            key={i}
            className={`char ${charId}`}
            draggable
            onDragStart={(e) => handleDragStart(e, charId)}
            whileDrag={{ scale: 1.2, zIndex: 99 }}
          />
        ))}
      </div>

      {/* Tier Settings Modal with AnimatePresence for animations */}
      <AnimatePresence>
        {settings && (
          <motion.div
            className="showsettings"
            ref={settingsRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="colour">
              {[
                "#FF0055", "#FF6B00", "#FFD500", "#00E676", "#00B8FF",
                "#A94BFF", "#FF61C3", "#00F0FF", "#FFF685", "#444AFF",
              ].map((clr, i) => (
                <div
                  key={i}
                  className="colours"
                  style={{ backgroundColor: clr }}
                  onClick={() => setColor(clr)}
                />
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back to top + character select */}
      <button
        className="to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        ↑
      </button>

      <a href="https://fightercenter.net/">
        <button className="changechar">Character Select</button>
      </a>
    </div>
  );
}

export default App;
