# coding=utf-8
import datetime
import os
from random import randint

from flask import Flask, json, render_template, request
from flask_bootstrap import Bootstrap
from sqlalchemy import desc

from model import BomboraRecord, connect_to_db, DashboardBlocks

app = Flask(__name__)
Bootstrap(app)

bombora_dates = []


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
    categories_list = [u'cloud', u'desktop', u'trends', u'video', u'social', u'sales', u'technology', u'gaming',
                       u'hardware', u'diversity', u'web', u'agency/dept', u'financial', u'messaging', u'crm',
                       u'insurance', u'data center', u'ecommerce', u'security', u'automotive', u'programming languages',
                       u'disease control', u'productivity software', u'networking', u'smartphone', u'policy & culture',
                       u'virtualization', u'operating system', u'medical association', u'personal computer',
                       u'corporate finance', u'standards & regulatory', u'operations', u'wireless', u'benefits',
                       u'tools & electronics', u'mobile', u'staff administration', u'email marketing',
                       u'software engineering', u'compliance & governance', u'business finance', u'servers',
                       u'wellness and safety', u'staff departure', u'aerospace', u'data management', u'it management',
                       u'apis & services', u'government regulations', u'finance it', u'labor relations',
                       u'medical research', u'email', u'training & development', u'supply chain', u'channels & types',
                       u'medical education', u'place of work', u'content', u'medical specialty', u'branding',
                       u'transactions & payments', u'administration', u'construction',
                       u'personal protective equipment (ppe)', u'media & advertising', u'analytics & reporting',
                       u'manufacturing', u'health', u'business solutions', u'campaigns', u'performance',
                       u'medical treatment', u'hr tech', u'other', u'emerging tech', u'budgeting, planning & strategy',
                       u'tablets & readers', u'auto brands', u'health tech', u'search engine', u'demand generation',
                       u'certifications', u'urban planning', u'trading & investing', u'enterprise', u'gadgets',
                       u'accounting', u'creativity software', u'energy', u'web browser', u'legal & regulatory',
                       u'product development & qa', u'ad tech', u'professional services', u'monitoring',
                       u'gaming consoles', u'health insurance', u'payroll & comp', u'programs and services',
                       u'personal finance', u'employee services', u'device connectivity', u'strategy & analysis',
                       u'telecommunications', u'website publishing', u'controls & standards', u'database',
                       u'document management', u'search marketing', u'recruitment, hiring & onboarding', u'agencies',
                       u'leadership & strategy', u'storage', u'patient management']

    return render_template('insights.html', industries=industry_list, categories=categories_list,
                           number_of_dates=len(bombora_dates))


@app.route('/dates')
def get_dates():
    date_strings = map(lambda x: x.strftime('%Y-%m-%d'), bombora_dates)
    return json.dumps(date_strings)

@app.route('/records')
def get_records():
    search_date_index = int(request.args.get('date_index'))
    search_date = bombora_dates[search_date_index-1]
    industry = request.args.get('industry').replace('_', ' ').replace('%26', '&')
    all_records_per_date = BomboraRecord.query.filter_by(
        date=search_date, industry=industry
    ).order_by(desc(BomboraRecord.count)).limit(200)

    all_records = {
        'industry': industry,
        'children': []
    }

    all_categories = []

    for record in all_records_per_date:
        if record.category not in all_categories:
            all_categories.append(record.category)
        record_dict = {
            'count': record.count,
            'category': record.category,
            'average_score': int(record.average_score),
        }
        all_records['children'].append(record_dict)

    return json.dumps(all_records)


@app.route('/records-by-category')
def get_records_by_category():
    search_date_index = int(request.args.get('date_index'))
    search_date = bombora_dates[search_date_index - 1]
    category = request.args.get('category').replace('_', ' ').replace('%26', '&')
    all_records_per_cat = BomboraRecord.query.filter_by(
        date=search_date, category=category
    ).order_by(desc(BomboraRecord.count)).limit(100)

    all_records = {
        'category': category,
        'children': []
    }

    for record in all_records_per_cat:
        record_dict = {
            'count': record.count,
            'industry': record.industry,
            'category': record.category,
            'average_score': int(record.average_score),
        }
        all_records['children'].append(record_dict)

    return json.dumps(all_records)


@app.route('/records-trend')
def get_trend():
    category = request.args.get('category')
    industry = request.args.get('industry')
    all_records = BomboraRecord.query.filter_by(
        category=category, industry=industry
    ).order_by(BomboraRecord.date).all()

    all_records_dict = {
        'data': []
    }

    for record in all_records:
        record_dict = {
            'date': record.date,
            'count': record.count,
            'average_score': record.average_score
        }
        all_records_dict['data'].append(record_dict)

    return json.dumps(all_records_dict)


@app.route('/players-dashboard')
def player_dashboard():
    industries_list = [u'Semiconductors', u'Advertising', u'Financial Services', u'Software', u'Pharma & Biotech', u'Aerospace', u'Agricultural Chemicals', u'Air Freight/Delivery Services', u'Aluminum', u'Apparel', u'Auto', u'Beverages (Production/Distribution)', u'Books', u'Broadcasting', u'Building', u'Business Services', u'Catalog/Specialty Distribution', u'Clothing/Shoe/Accessory Stores', u'Coal Mining', u'Commercial Banks', u'Computer Hardware', u'Consumer', u'Containers/Packaging', u'Diversified Commercial Services', u'EDP Services', u'Electronic', u'Engineering / Mfg etc', u'Environmental Services', u'Farming/Seeds/Milling', u'Fluid Controls', u'Food', u'Forest Products', u'General Bldg Contractors - Nonresidential Bldgs', u'Home Furnishings', u'Homebuilding', u'Hospital/Nursing Management', u'Hotels/Resorts', u'Major Chemicals', u'Marine Transportation', u'Meat/Poultry/Fish', u'Medical Specialities', u'Medical/Dental Instruments', u'Medical/Nursing Services', u'Metal Fabrications', u'Military/Government/Technical', u'Mining & Quarrying of Nonmetallic Minerals (No Fuels)', u'Miscellaneous', u'Miscellaneous Manufacturing Industries', u'Motor Vehicles', u'Movies/Entertainment', u'Multi-Sector Companies', u'Natural Gas Distribution', u'Newspapers/Magazines', u'Office Equipment/Supplies/Services', u'Oil', u'Ophthalmic Goods', u'Ordinance And Accessories', u'Other Specialty Stores', u'Other Transportation', u'Package Goods/Cosmetics', u'Paints/Coatings', u'Paper', u'Plastic Products', u'Pollution Control Equipment', u'Power Generation', u'Precious Metals', u'Precision Instruments', u'Professional Services', u'Property-Casualty Insurers', u'Publishing', u'Radio And Television Broadcasting And Communications Equipment', u'Railroads', u'Real Estate', u'Real Estate Investment Trusts', u'Recreational Products/Toys', u'Rental/Leasing Companies', u'Restaurants', u'Retail', u'Savings Institutions', u'Services-Misc. Amusement & Recreation', u'Shoe Manufacturing', u'Specialty Chemicals', u'Specialty Insurers', u'Steel/Iron Ore', u'Telecommunications Equipment', u'Television Services', u'Textiles', u'Tools/Hardware', u'Transportation Services', u'Trucking Freight/Courier Services', u'Water Supply', u'Wholesale Distributors']
    rand_id = randint(1, 4)
    print "RAND INT", rand_id
    one_industry = DashboardBlocks.query.get(rand_id)

    dashboard_block = {
        'industry': one_industry.industry,
        'market_cap': one_industry.market_cap,
        'cap_raised': one_industry.cap_raised,
        'cagr': one_industry.cagr,
        'forecast_spend': one_industry.forecast_spend
    }

    return render_template('player-dashboard.html',
                           dashboard_block=dashboard_block,
                           industries_list=industries_list)

@app.route('/get-dashboard')
def get_dashboard():
    industry = request.args.get('industry').replace('_', ' ').replace('%26', '&')
    one_industry = DashboardBlocks.query.filter_by(industry=industry).first()

    dashboard_block = {
        'industry': one_industry.industry,
        'market_cap': one_industry.market_cap,
        'cap_raised': one_industry.cap_raised,
        'cagr': one_industry.cagr,
        'forecast_spend': one_industry.forecast_spend
    }

    return json.dumps(dashboard_block)


if __name__ == "__main__":

    connect_to_db(app)
    PORT = int(os.environ.get("PORT", 5000))
    DEBUG = "NO_DEBUG" not in os.environ
    global bombora_dates
    bombora_dates = map(lambda x: x.date, BomboraRecord.query.distinct(BomboraRecord.date).all())
    app.run(debug=DEBUG, host="0.0.0.0", port=PORT)
