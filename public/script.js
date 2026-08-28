// 1. Backend se Parcels fetch karke screen par dikhana
function loadParcels() {
    fetch('/api/parcels')
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('parcels-container');
            container.innerHTML = '';

            if (data.parcels && data.parcels.length > 0) {
                data.parcels.forEach(p => {
                    container.innerHTML += `
                        <div class="parcel-card">
                            <h3>${p.title || 'No Title'} <span class="badge">${p.status || 'N/A'}</span></h3>
                            <p><strong>ID:</strong> ${p.id}</p>
                            <p><strong>Owner:</strong> ${p.owner_name || 'Unknown'}</p>
                            <p><strong>Area:</strong> ${p.area_sq_ft || 0} sq ft</p>
                        </div>
                    `;
                });
            } else {
                container.innerHTML = '<p>No parcels found.</p>';
            }
        })
        .catch(err => console.error("Error loading parcels:", err));
}

// 2. Frontend Form se Direct Naya Parcel Add Karna
document.getElementById('add-parcel-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const newParcel = {
        id: document.getElementById('parcel_id').value,
        title: document.getElementById('title').value,
        owner_name: document.getElementById('owner_name').value,
        area_sq_ft: Number(document.getElementById('area_sq_ft').value),
        status: document.getElementById('status').value,
        coordinates: "[77.10, 28.57]"
    };

    fetch('/api/parcels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newParcel)
    })
    .then(res => res.json())
    .then(data => {
        alert("Parcel Added Successfully!");
        document.getElementById('add-parcel-form').reset();
        loadParcels(); // List refresh karo
    })
    .catch(err => console.error("Error adding parcel:", err));
});

// Initial load
loadParcels();