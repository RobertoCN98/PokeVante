from PIL import Image
try:
    with Image.open("c:\\Users\\adrib\\Desktop\\PokeVante\\public\\assets\\sprites\\jugadorPequeño.png") as img:
        print(f"Dimensions: {img.width} x {img.height}")
except Exception as e:
    print(f"Error: {e}")
