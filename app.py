from flask import Flask, redirect, render_template, request, jsonify, url_for
from datetime import datetime
import os

app = Flask(__name__)  # <-- THIS MUST BE FIRST

# In-memory database
properties_db = [
     {
        "id": 1,
        "title": "Modern Luxury Villa",
        "price": "$850,000",
        "location": "Beverly Hills, CA",
        "beds": 5,
        "baths": 4,
        "sqft": "4,200",
        "badge": "For Sale",
        "icon": "fa-home",
        "description": "Stunning modern villa with panoramic city views, infinity pool, and smart home technology.",
        "featured": True
    },
    {
        "id": 2,
        "title": "Skyline Penthouse",
        "price": "$1,200,000",
        "location": "Manhattan, NY",
        "beds": 3,
        "baths": 3,
        "sqft": "2,800",
        "badge": "For Sale",
        "icon": "fa-building",
        "description": "Exclusive penthouse with 360° skyline views, private elevator, and rooftop terrace.",
        "featured": True
    },
    {
        "id": 3,
        "title": "Oceanfront Estate",
        "price": "$2,500,000",
        "location": "Miami Beach, FL",
        "beds": 6,
        "baths": 5,
        "sqft": "5,500",
        "badge": "Premium",
        "icon": "fa-umbrella-beach",
        "description": "Direct ocean access, private beach, and resort-style amenities in this gated estate.",
        "featured": True
    },
    {
        "id": 4,
        "title": "Urban Downtown Loft",
        "price": "$3,500/mo",
        "location": "Austin, TX",
        "beds": 2,
        "baths": 2,
        "sqft": "1,800",
        "badge": "For Rent",
        "icon": "fa-city",
        "description": "Industrial-chic loft in the heart of downtown with exposed brick and modern finishes.",
        "featured": False
    },
    {
        "id": 5,
        "title": "Alpine Mountain Retreat",
        "price": "$1,800,000",
        "location": "Aspen, CO",
        "beds": 4,
        "baths": 3,
        "sqft": "3,600",
        "badge": "For Sale",
        "icon": "fa-mountain",
        "description": "Ski-in/ski-out luxury cabin with heated floors, stone fireplace, and mountain views.",
        "featured": False
    },
    {
        "id": 6,
        "title": "Family Suburban Home",
        "price": "$650,000",
        "location": "Naperville, IL",
        "beds": 4,
        "baths": 3,
        "sqft": "2,900",
        "badge": "For Sale",
        "icon": "fa-house-chimney",
        "description": "Perfect family home in top-rated school district with large backyard and finished basement.",
        "featured": False
    }
]

contacts_db = []

# Company stats (can be fetched from database)
stats = {
    "properties_sold": 500,
    "happy_clients": 350,
    "years_experience": 15,
    "expert_agents": 50
}

@app.route('/')
def home():
    featured_properties = [p for p in properties_db if p['featured']]
    return render_template('index.html', 
                         properties=properties_db,
                         featured=featured_properties,
                         stats=stats,
                         year=datetime.now().year)

@app.route('/api/properties')
def api_properties():
    """API endpoint to get all properties as JSON"""
    return jsonify(properties_db)

@app.route('/api/property/<int:property_id>')
def api_property(property_id):
    """API endpoint to get single property details"""
    property = next((p for p in properties_db if p['id'] == property_id), None)
    if property:
        return jsonify(property)
    return jsonify({"error": "Property not found"}), 404

@app.route('/api/contact', methods=['POST'])
def api_contact():
    """API endpoint to handle contact form submissions"""
    data = request.get_json()
    
    contact = {
        "id": len(contacts_db) + 1,
        "first_name": data.get('first_name'),
        "last_name": data.get('last_name'),
        "email": data.get('email'),
        "phone": data.get('phone'),
        "interest": data.get('interest'),
        "message": data.get('message'),
        "date_submitted": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    contacts_db.append(contact)
    
    # Here you would typically send an email notification
    # send_email_notification(contact)
    
    return jsonify({"success": True, "message": "Thank you! We will contact you soon."})

@app.route('/api/search')
def api_search():
    """API endpoint to search properties"""
    query = request.args.get('q', '').lower()
    location = request.args.get('location', '').lower()
    min_price = request.args.get('min_price', 0)
    max_price = request.args.get('max_price', float('inf'))
    
    results = properties_db
    
    if query:
        results = [p for p in results if query in p['title'].lower() or query in p['location'].lower()]
    
    if location:
        results = [p for p in results if location in p['location'].lower()]
    
    return jsonify(results)

@app.route('/admin')
def admin_dashboard():
    """Simple admin panel to view submissions"""
    return render_template('admin.html', contacts=contacts_db, properties=properties_db)

@app.route('/admin/contact/<int:contact_id>/delete', methods=['POST'])
def delete_contact(contact_id):
    """Delete a contact submission"""
    global contacts_db
    contacts_db = [c for c in contacts_db if c['id'] != contact_id]
    return redirect(url_for('admin_dashboard'))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)


# Your routes go here...

# ONLY ONE if __name__ block at the VERY BOTTOM:

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
