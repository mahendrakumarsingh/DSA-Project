import { useState, useEffect } from 'react';
import axios from 'axios';
import './DSADashboard.css';

const DSADashboard = ({ apiUrl = '/api' }) => {
    const [route, setRoute] = useState({ from: 'Delhi', to: 'Mumbai', path: null, error: null });
    const [pnrSearch, setPnrSearch] = useState({ query: '', result: null, error: null });
    const [waitingList, setWaitingList] = useState([]);
    const [seatMap, setSeatMap] = useState(null);

    useEffect(() => {
        fetchWaitingList();
        fetchSeatMap();
    }, []);

    const fetchWaitingList = async () => {
        try {
            const res = await axios.get(`${apiUrl}/dsa/waiting-list`);
            setWaitingList(res.data.heap || []);
        } catch (err) {
            console.error('Error fetching waiting list', err);
        }
    };

    const fetchSeatMap = async () => {
        try {
            const res = await axios.get(`${apiUrl}/dsa/seats`);
            setSeatMap(res.data.structure);
        } catch (err) {
            console.error('Error fetching seat map', err);
        }
    };

    const handleRouteSearch = async () => {
        try {
            setRoute(prev => ({ ...prev, path: null, error: null }));
            const res = await axios.get(`${apiUrl}/dsa/route?from=${route.from}&to=${route.to}`);
            setRoute(prev => ({ ...prev, path: res.data }));
        } catch (err) {
            setRoute(prev => ({ ...prev, error: 'Path not found' }));
        }
    };

    const handlePnrSearch = async () => {
        try {
            setPnrSearch(prev => ({ ...prev, result: null, error: null }));
            const res = await axios.get(`${apiUrl}/dsa/search/${pnrSearch.query}`);
            setPnrSearch(prev => ({ ...prev, result: res.data.data }));
        } catch (err) {
            setPnrSearch(prev => ({ ...prev, error: 'PNR Not Found in BST' }));
        }
    };

    // Recursive Tree Renderer
    const renderTree = (node) => {
        if (!node) return null;
        return (
            <div className="tree-node">
                <div className={`node-content ${node.type.toLowerCase()}`}>
                    <span className="node-icon">
                        {node.type === 'Train' ? '🚆' : node.type === 'Coach' ? '🚃' : '💺'}
                    </span>
                    <span className="node-name">{node.name}</span>
                    {node.type === 'Seat' && (
                        <span className={`seat-status ${node.isBooked ? 'booked' : 'free'}`}>
                            {node.isBooked ? 'Booked' : 'Free'}
                        </span>
                    )}
                </div>
                {node.children && node.children.length > 0 && (
                    <div className="tree-children" style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', marginLeft: '12px' }}>
                        {node.children.map((child, idx) => (
                            <div key={idx} className="tree-child">
                                {renderTree(child)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const cities = ['Delhi', 'Jaipur', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Lucknow'];

    return (
        <div className="dsa-dashboard page-container">
            <div className="page-header" style={{ marginBottom: '40px' }}>
                <h2>DSA Visualization Logic</h2>
                <p className="subtitle">Real-time view of internal data structures powering the system.</p>
            </div>

            <div className="grid-2">
                {/* 1. Dijkstra Route Finder */}
                <div className="card">
                    <div className="flex-between" style={{ marginBottom: '16px' }}>
                        <h3>🛤️ Graph: Shortest Path</h3>
                        <span className="muted" style={{ fontSize: '11px', border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: '4px' }}>Dijkstra</span>
                    </div>

                    <div className="form-group flex-gap-2" style={{ alignItems: 'flex-end', marginBottom: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <label>From</label>
                            <select value={route.from} onChange={e => setRoute({ ...route, from: e.target.value })}>
                                {cities.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <span style={{ color: 'var(--text-muted)', marginBottom: '14px', fontSize: '18px' }}>➜</span>
                        <div style={{ flex: 1 }}>
                            <label>To</label>
                            <select value={route.to} onChange={e => setRoute({ ...route, to: e.target.value })}>
                                {cities.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <button className="btn primary" onClick={handleRouteSearch} style={{ width: '100%' }}>Find Best Route</button>

                    {route.path && (
                        <div className="message-box success">
                            <div>
                                <p style={{ fontWeight: '600', marginBottom: '4px' }}>Shortest Path Found!</p>
                                <p style={{ fontSize: '13px' }}>Distance: <span style={{ fontWeight: 'bold' }}>{route.path.distance} km</span></p>
                                <div className="route-visual" style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-main)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {route.path.path.map((city, i) => (
                                        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {city} {i < route.path.path.length - 1 && <span style={{ color: 'var(--text-muted)' }}>➝</span>}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {route.error && <div className="message-box error">⚠️ {route.error}</div>}
                </div>

                {/* 2. BST Search */}
                <div className="card">
                    <div className="flex-between" style={{ marginBottom: '16px' }}>
                        <h3>🔍 BST: PNR Search</h3>
                        <span className="muted" style={{ fontSize: '11px', border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: '4px' }}>Binary Search Tree</span>
                    </div>

                    <div className="form-group" style={{ display: 'flex', gap: '12px' }}>
                        <input
                            placeholder="Enter PNR..."
                            value={pnrSearch.query}
                            onChange={e => setPnrSearch({ ...pnrSearch, query: e.target.value })}
                            style={{ flex: 1 }}
                        />
                        <button className="btn primary" onClick={handlePnrSearch} style={{ padding: '0 24px' }}>Search</button>
                    </div>

                    {pnrSearch.result && (
                        <div className="message-box success" style={{ flexDirection: 'column', gap: '0' }}>
                            <p style={{ fontWeight: '600', marginBottom: '8px' }}>Found in BST Node:</p>
                            <div className="json-box" style={{ width: '100%' }}>
                                <pre>{JSON.stringify({
                                    name: pnrSearch.result.name,
                                    status: pnrSearch.result.status,
                                    pnr: pnrSearch.result.pnr
                                }, null, 2)}</pre>
                            </div>
                        </div>
                    )}
                    {pnrSearch.error && <div className="message-box error">⚠️ {pnrSearch.error}</div>}
                </div>
            </div>

            {/* 3. Priority Queue */}
            <div className="card" style={{ marginTop: '24px' }}>
                <div className="flex-between" style={{ marginBottom: '24px' }}>
                    <div>
                        <h3>⏳ Priority Queue: Waiting List</h3>
                        <p className="muted">Senior Citizens & Tatkal tickets automatically float to the root (Max-Heap).</p>
                    </div>
                </div>

                <div className="heap-visual">
                    {waitingList.length === 0 ? (
                        <div className="empty-state">
                            <span style={{ fontSize: '24px', display: 'block', marginBottom: '12px' }}>😴</span>
                            Waiting list is currently empty. Book more tickets to see the Max-Heap in action!
                        </div>
                    ) : (
                        waitingList.map((item, i) => (
                            <div key={i} className="heap-node">
                                <span className="priority-badge">Priority: {item.priority}</span>
                                <div className="pnr">{item.pnr}</div>
                                <div className="name">{item.name}</div>
                                <div className="reason">{item.reason}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 4. Seat Map Tree */}
            <div className="card" style={{ marginTop: '24px' }}>
                <div className="flex-between" style={{ marginBottom: '24px' }}>
                    <div>
                        <h3>💺 N-ary Tree: Seat Hierarchy</h3>
                        <p className="muted">Hierarchical structure: Train ➝ Coach ➝ Seat</p>
                    </div>
                </div>

                <div className="tree-container">
                    {seatMap ? renderTree(seatMap) : <p className="muted">Loading Tree Structure...</p>}
                </div>
            </div>
        </div>
    );
};

export default DSADashboard;
