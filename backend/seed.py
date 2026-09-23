import json
from pathlib import Path
from app.core.database import SessionLocal, engine, Base
from app.models import Product, Material, Component, ComponentMaterial

DATA_DIR = Path(__file__).parent / "app" / "data"

def seed_database():
    print("Creating all database tables if not present...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Seed Materials
        materials_file = DATA_DIR / "materials.json"
        with open(materials_file, "r", encoding="utf-8") as f:
            materials_data = json.load(f)

        material_lookup = {}
        for mat_info in materials_data:
            existing = db.query(Material).filter(Material.name == mat_info["name"]).first()
            if not existing:
                material = Material(
                    name=mat_info["name"],
                    category=mat_info["category"],
                    market_value_per_kg=mat_info["market_value_per_kg"],
                    recovery_rate=mat_info["recovery_rate"],
                    hazard_level=mat_info["hazard_level"],
                    environmental_impact_factor=mat_info.get("environmental_impact_factor", 1.0)
                )
                db.add(material)
                db.flush()
                material_lookup[material.name] = material
            else:
                material_lookup[existing.name] = existing

        print(f"Loaded {len(material_lookup)} materials.")

        # 2. Seed Laptop Product and Components
        taxonomy_file = DATA_DIR / "laptop_taxonomy.json"
        with open(taxonomy_file, "r", encoding="utf-8") as f:
            taxonomy = json.load(f)

        product = db.query(Product).filter(Product.category == taxonomy["category"]).first()
        if not product:
            product = Product(
                name=taxonomy["name"],
                category=taxonomy["category"],
                brand="Universal Reference Model",
                model="15.6-inch Portable Computer",
                average_weight_kg=taxonomy["average_weight_kg"]
            )
            db.add(product)
            db.flush()
            print(f"Created product: {product.name} ({product.category})")

        # 3. Seed Components and ComponentMaterials
        for comp_info in taxonomy["components"]:
            comp = db.query(Component).filter(
                Component.product_id == product.id,
                Component.code == comp_info["code"]
            ).first()

            if not comp:
                comp = Component(
                    product_id=product.id,
                    name=comp_info["name"],
                    code=comp_info["code"],
                    default_category=comp_info["default_category"],
                    weight_kg=comp_info["weight_kg"],
                    removal_time_min=comp_info["removal_time_min"],
                    damage_probability=comp_info["damage_probability"],
                    market_value_inr=comp_info["market_value_inr"],
                    hazard_level=comp_info["hazard_level"],
                    is_hazardous=comp_info["is_hazardous"],
                    allow_manual_disassembly=comp_info["allow_manual_disassembly"],
                    data_wipe_required=comp_info.get("data_wipe_required", False),
                    recycling_channel=comp_info["recycling_channel"],
                    handling_dos=comp_info["handling_dos"],
                    handling_donts=comp_info["handling_donts"]
                )
                db.add(comp)
                db.flush()

                # Associate Materials
                for mat_name, fraction in comp_info.get("materials", {}).items():
                    if mat_name in material_lookup:
                        assoc = ComponentMaterial(
                            component_id=comp.id,
                            material_id=material_lookup[mat_name].id,
                            mass_fraction=fraction
                        )
                        db.add(assoc)

        db.commit()
        print(f"Successfully seeded database with {len(taxonomy['components'])} laptop components and material links.")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
