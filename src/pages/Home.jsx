import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../services/api";
import Footer from "../components/Common/Footer";

export default function Home({ darkMode, setDarkMode }) {
  const quotes = [
    "“Travel isn’t always pretty. It isn’t always comfortable. But it changes you.” – Anthony Bourdain",
    "“The world is a book and those who do not travel read only one page.” – Saint Augustine",
    "“Jobs fill your pocket, but adventures fill your soul.” – Jaime Lyn Beatty",
  ];

  const [destinations, setDestinations] = useState([]);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [destinationIndex, setDestinationIndex] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/Places");
        const list = Array.isArray(res?.data) ? res.data : [];
        const mapped = list
          .slice(0, 20)
          .map((p) => ({
            id: p.placeId,
            image: p.imageUrl || "",
            name: p.name,
            description: p.description || "",
          }))
          .filter((d) => d.name);
        setDestinations(mapped);
        setDestinationIndex(0);
      } catch (err) {
        console.error("Home: failed to load places", err);
        setDestinations([]);
      }
    })();
  }, []);

  useEffect(() => {
    const quoteTimer = setInterval(
      () => setQuoteIndex((prev) => (prev + 1) % quotes.length),
      5000
    );

    let destinationTimer;
    if (destinations.length > 0) {
      destinationTimer = setInterval(
        () => setDestinationIndex((prev) => (prev + 1) % destinations.length),
        5000
      );
    }
    return () => {
      clearInterval(quoteTimer);
      if (destinationTimer) clearInterval(destinationTimer);
    };
  }, [quotes.length, destinations.length]);

  const firstLineOf = (s) => (s || "").split(/\r?\n/)[0].trim();

  const containerStyle = {
    backgroundImage:
      'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: darkMode ? "#edf2f7" : "#1a202c",
    padding: "2rem",
    minHeight: "100vh",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    textAlign: "center",
    overflow: "hidden",
    width: "100%",
  };

  const overlayStyle = {
    position: "absolute",
    inset: 0,
    backgroundColor: darkMode ? "rgba(26,32,44,0.7)" : "rgba(255,255,255,0.6)",
    zIndex: 0,
  };

  const contentStyle = { position: "relative", zIndex: 1, maxWidth: "800px", width: "100%" };

  const cardBase = {
    backgroundColor: darkMode ? "rgba(74,85,104,0.9)" : "rgba(255,255,255,0.9)",
    color: darkMode ? "#f7fafc" : "#2d3748",
    borderRadius: "0.75rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  };

  const quoteCardStyle = {
    ...cardBase,
    padding: "1rem 1.5rem",
    fontStyle: "italic",
    marginBottom: "2rem",
  };

  const travelCardStyle = {
    ...cardBase,
    padding: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginTop: "2rem",
    textAlign: "left",
  };

  const current = destinations[destinations.length ? destinationIndex : 0];

  return (
    <div style={containerStyle}>
      <div style={overlayStyle}></div>
      <div style={contentStyle}>
        {/* Quote Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={quoteIndex}
            style={quoteCardStyle}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
          >
            {quotes[quoteIndex]}
          </motion.div>
        </AnimatePresence>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "1rem" }}
        >
          Discover & Book Amazing Places
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ marginBottom: "1.5rem", fontSize: "1.1rem" }}
        >
          Browse museums, zoos, and attractions. Book tickets securely with Razorpay.
        </motion.p>

        {/* Explore Button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <Link
            to="/places"
            style={{
              display: "inline-block",
              padding: "0.75rem 1.25rem",
              backgroundColor: "#3182ce",
              color: "#fff",
              borderRadius: "0.375rem",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "1rem",
            }}
          >
            Explore Places
          </Link>
        </motion.div>

        {/* Rotating Destination Card from DB (image + name + FIRST LINE OF DESCRIPTION) */}
        <AnimatePresence mode="wait">
          {current ? (
            <motion.div
              key={current.id + "-" + destinationIndex}
              style={travelCardStyle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              <Link
                to={`/places/${current.id}`}
                style={{ display: "flex", alignItems: "center", gap: "1rem", textDecoration: "none", color: "inherit" }}
              >
                <img
                  src={current.image || "https://via.placeholder.com/160x160?text=No+Image"}
                  alt={current.name}
                  style={{ width: "80px", height: "80px", borderRadius: "0.5rem", objectFit: "cover" }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: "bold", fontSize: "1rem" }}>{current.name}</div>
                  <div
                    style={{
                      marginTop: "0.15rem",
                      fontSize: "0.95rem",
                      opacity: 0.85,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "520px",
                    }}
                  >
                    {firstLineOf(current.description) || "No description available"}
                  </div>
                </div>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              style={travelCardStyle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <span>No places yet — add one from the Owner dashboard.</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
          <Footer />
    </div>

  );
}