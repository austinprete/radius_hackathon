from collections import defaultdict
import datetime
import os

from flask import Flask, json, jsonify, render_template, request, url_for
from flask_bootstrap import Bootstrap

from model import BomboraRecord, connect_to_db, db

app = Flask(__name__)
Bootstrap(app)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/insights', methods=['GET'])
def insights():
    industry_list = [u'accounting', u'airlines/aviation', u'alternative dispute resolution', u'alternative medicine',
                     u'animation', u'apparel & fashion', u'architecture & planning', u'arts and crafts', u'automotive',
                     u'aviation & aerospace', u'banking', u'biotechnology', u'broadcast media', u'building materials',
                     u'business supplies and equipment', u'capital markets', u'chemicals',
                     u'civic & social organization', u'civil engineering', u'commercial real estate',
                     u'computer & network security', u'computer games', u'computer hardware', u'computer networking',
                     u'computer software', u'construction', u'consumer electronics', u'consumer goods',
                     u'consumer services', u'cosmetics', u'dairy', u'defense & space', u'design', u'e-learning',
                     u'education management', u'electrical/electronic manufacturing', u'entertainment',
                     u'environmental services', u'events services', u'executive office', u'facilities services',
                     u'farming', u'financial services', u'fine art', u'fishery', u'food & beverages',
                     u'food production', u'fund-raising', u'furniture', u'gambling & casinos',
                     u'glass, ceramics & concrete', u'government administration', u'government relations',
                     u'graphic design', u'health, wellness and fitness', u'higher education',
                     u'hospital & health care', u'hospitality', u'human resources', u'import and export',
                     u'individual & family services', u'industrial automation', u'information services',
                     u'information technology and services', u'insurance', u'international affairs',
                     u'international trade and development', u'internet', u'internet internet', u'investment banking',
                     u'investment management', u'judiciary', u'law enforcement', u'law practice', u'legal services',
                     u'legislative office', u'leisure, travel & tourism', u'libraries', u'logistics and supply chain',
                     u'luxury goods & jewelry', u'machinery', u'management consulting', u'maritime',
                     u'market research', u'marketing and advertising', u'mechanical or industrial engineering',
                     u'media production', u'medical devices', u'medical practice', u'mental health care', u'military',
                     u'mining & metals', u'motion pictures and film', u'museums and institutions', u'music',
                     u'nanotechnology', u'newspapers', u'nonprofit organization management', u'oil & energy',
                     u'online media', u'outsourcing/offshoring', u'package/freight delivery',
                     u'packaging and containers', u'paper & forest products', u'performing arts', u'pharmaceuticals',
                     u'philanthropy', u'photography', u'plastics', u'political organization',
                     u'primary/secondary education', u'printing', u'professional training & coaching',
                     u'program development', u'public policy', u'public relations and communications',
                     u'public safety', u'publishing', u'railroad manufacture', u'ranching', u'real estate',
                     u'recreational facilities and services', u'religious institutions', u'renewables & environment',
                     u'research', u'restaurants', u'retail', u'security and investigations', u'semiconductors',
                     u'shipbuilding', u'sporting goods', u'sports', u'staffing and recruiting', u'supermarkets',
                     u'telecommunications', u'textiles', u'think tanks', u'tobacco', u'translation and localization',
                     u'transportation/trucking/railroad', u'utilities', u'venture capital & private equity',
                     u'veterinary', u'warehousing', u'wholesale', u'wine and spirits', u'wireless',
                     u'writing and editing']

    return render_template('insights.html', industries=industry_list)


@app.route('/records')
def get_records():
    # search_date = request.args.get('date')
    search_date = datetime.datetime.strptime('2015-05-08', '%Y-%m-%d')
    print search_date
    industry = request.args.get('industry').replace('_', ' ').replace('%26', '&')
    print type(BomboraRecord.query.first().date)
    all_records_per_date = BomboraRecord.query.filter_by(date=search_date).all()

    all_records = {
        'industry': industry,
        'children': []
    }

    for record in all_records_per_date:
        print record.json_data
        print record.date
        if record.json_data['industry'] == industry:
            all_records['children'].append(record.json_data)
    print all_records
    return json.dumps(all_records)


if __name__ == "__main__":

    connect_to_db(app)
    PORT = int(os.environ.get("PORT", 5000))
    DEBUG = "NO_DEBUG" not in os.environ
    app.run(debug=DEBUG, host="0.0.0.0", port=PORT)