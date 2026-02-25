import requests
r = requests.post('http://localhost:5001/explain', json={
    'age':100,'gender':1,'height':156,'weight':110,
    'ap_hi':120,'ap_lo':80,'cholesterol':1,'gluc':1,
    'smoke':1,'alco':0,'active':1
})
print("Status:", r.status_code)
data = r.json()
for x in data.get('feature_impacts', []):
    sols = x.get('solutions', [])
    print(f"  {x['feature']:20s} | {x['direction']:10s} | {len(sols)} solutions")
    for s in sols[:2]:
        print(f"    -> {s}")
