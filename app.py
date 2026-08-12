from flask import Flask, redirect, render_template, request, jsonify, url_for
from datetime import datetime
import os


app = Flask(__name__)  # <-- THIS MUST BE FIRST

# In-memory database
properties_db = [
     {
        "id": 1,
        "title": "Luxury",
        "price": "₦750,000,000",
        "location": "Chevron, lekki, lagos.",
        "images": [
            "image/villa1.jpg"
        ],
        "tiktok": "https://www.tiktok.com/@shaggylexproperty/video/7563959985529523474?is_from_webapp=1&sender_device=pc&web_id=7567663620428563985",
        "beds": 6,
        "baths": 6,
        "sqft": "Not specified",
        "badge": "For Sale",
        "description": "Stunning modern villa with panoramic city views, infinity pool, and smart home technology.",
        "featured": True
    },
    {
        "id": 2,
        "title": "Luxury",
        "price": "₦600,000,000",
        "location": "Omole phase 1",
        "images": [
            "image/penthouse1.jpg"
        ],
        "tiktok": "https://www.tiktok.com/@shaggylexproperty/video/7643429980919041301?is_from_webapp=1&sender_device=pc",
        "beds": 5,
        "baths": 5,
        "sqft": "Not specified",
        "badge": "For Sale",
        "description": "Exclusive penthouse with 360° skyline views, private elevator, and rooftop terrace.",
        "featured": True
    },
    {
        "id": 3,
        "title": "Semi-Detached",
        "price": "₦300,000,000",
        "location": "Opebi ikeja, Lagos",
        "images": [
            "image/estate1.jpg"
        ],
        "tiktok": "https://www.tiktok.com/@shaggylexproperty/video/7656940062935977237?is_from_webapp=1&sender_device=pc",
        "beds": 6,
        "baths": 5,
        "sqft": "Not specified",
        "badge": "Premium",
        "description": "Direct ocean access, private beach, and resort-style amenities in this gated estate.",
        "featured": True
    },
    {
        "id": 4,
        "title": "Smart Home",
        "price": "₦400,000,000",
        "location": "Monumental Estate, Opebi ikeja",
        "images": [
            "image/loft1.jpg"
        ],
        "tiktok": "https://www.tiktok.com/@shaggylexproperty/video/7631515055208697109?is_from_webapp=1&sender_device=pc",
        "beds": 4,
        "baths": 4,
        "sqft": "Not specified",
        "badge": "For Rent",
        "description": "Industrial-chic loft in the heart of downtown with exposed brick and modern finishes.",
        "featured": False
    },
    {
        "id": 5,
        "title": "Luxury",
        "price": "₦280,000,000",
        "location": "Opebi ikeja,lagos",
        "images": [
            "image/familyhome1.jpg"
        ],
        "tiktok": "https://www.tiktok.com/@shaggylexproperty/video/7657117696764431636?is_from_webapp=1&sender_device=pc&web_id=7567663620428563985",
        "beds": 4,
        "baths": 3,
        "sqft": "Not specified",
        "badge": "For Sale",
        "description": "Perfect family home in top-rated school district with large backyard and finished basement.",
        "featured": False
    },
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

@app.route('/api/properties-debug')
def api_properties_debug():
    try:
        return jsonify(properties_db)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
