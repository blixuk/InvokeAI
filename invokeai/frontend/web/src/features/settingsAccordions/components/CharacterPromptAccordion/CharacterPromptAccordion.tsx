import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Button, Flex, FormControl, FormLabel, Input, Text, Divider, Heading } from '@invoke-ai/ui-library';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { memo } from 'react';
import { buildCharacterPrompt, characterAdded, characterRemoved, characterUpdated, selectCharacterPromptSlice } from 'features/characterPrompt/store/characterPromptSlice';
import { PiFloppyDiskBold, PiPlusBold, PiTrashBold } from 'react-icons/pi';
import { useDisclosure } from '@invoke-ai/ui-library';
import { CharacterAccordionItem } from './CharacterAccordionItem';
import { SavedCharactersModal } from './SavedCharactersModal';

const GENDERS = ['Male', 'Female', 'Non-binary', 'Transgender', 'Androgynous', 'Genderfluid', 'Agender', 'Any'];
const AGES = ['Infant', 'Toddler', 'Child', 'Pre-teen', 'Teenager', 'Young Adult', 'Adult', 'Middle-aged', 'Elderly', 'Centenarian', 'Any'];
const ETHNICITIES = ['African', 'African American', 'Asian', 'Caucasian', 'East Asian', 'Hispanic', 'Latino/Latina', 'Middle Eastern', 'Native American', 'Pacific Islander', 'South Asian', 'Southeast Asian', 'Mixed Race', 'Any'];
const SKIN_TONES = ['Alabaster', 'Porcelain', 'Pale', 'Fair', 'Light', 'Medium', 'Olive', 'Tan', 'Golden', 'Bronze', 'Brown', 'Dark Brown', 'Ebony', 'Deep Dark', 'Any'];
const BODY_TYPES = ['Anorexic', 'Skinny', 'Slender', 'Petite', 'Slim', 'Athletic', 'Toned', 'Muscular', 'Bodybuilder', 'Average', 'Thick', 'Curvy', 'Voluptuous', 'Chubby', 'Overweight', 'Obese', 'Any'];
const BODY_SHAPES = ['Hourglass', 'Pear', 'Apple', 'Rectangle', 'Inverted Triangle', 'Athletic', 'Curvy', 'Any'];

const HAIR_COLORS = ['Jet Black', 'Black', 'Dark Brown', 'Brown', 'Light Brown', 'Dirty Blonde', 'Blonde', 'Platinum Blonde', 'Strawberry Blonde', 'Auburn', 'Red', 'Ginger', 'Grey', 'Silver', 'White', 'Blue', 'Green', 'Pink', 'Purple', 'Neon', 'Pastel', 'Ombre', 'Two-tone', 'Split-dye', 'Crow Black', 'Chunky Highlights', 'Any'];
const HAIR_STYLES = ['Bald', 'Buzz Cut', 'Pixie Cut', 'Bob Cut', 'Shoulder-length', 'Medium', 'Long', 'Very Long', 'Straight', 'Wavy', 'Curly', 'Coily/Kinky', 'Dreadlocks', 'Braids', 'Cornrows', 'Afro', 'Ponytail', 'High Ponytail', 'Scraped-back Ponytail', 'Pigtails', 'Twin Tails', 'Double-bun', 'Messy Bun', 'Messy Topknot', 'Spiky', 'Mullet', 'Undercut', 'Blunt-cut with bangs', 'Side-swept bangs', 'Messy', 'Any'];
const HAIR_LENGTHS = ['Bald', 'Shaved', 'Short', 'Shoulder-length', 'Medium', 'Long', 'Very Long', 'Floor-length', 'Any'];
const HAIR_TEXTURES = ['Straight', 'Wavy', 'Curly', 'Coily', 'Kinky', 'Crimped', 'Frizzy', 'Any'];

const FOUNDATIONS = ['Matte', 'Dewy', 'Luminous', 'Airbrushed', 'Thick Foundation', 'Pale Foundation', 'Fake Tan', 'None', 'Any'];
const BLUSHES = ['Light', 'Heavy', 'Sun-kissed', 'Rosy', 'Peach', 'Egirl Blush', 'None', 'Any'];
const EYE_COLORS = ['Black', 'Dark Brown', 'Brown', 'Light Brown', 'Hazel', 'Amber', 'Green', 'Blue', 'Light Blue', 'Grey', 'Violet', 'Red', 'Golden', 'Heterochromia (Different colors)', 'Any'];
const EYE_MAKEUPS = ['None', 'Natural', 'Smokey Eye', 'Cat Eye', 'Thick Black Eyeliner', 'Winged Eyeliner', 'Cut Crease', 'Glitter', 'Gothic Makeup', 'Corpse Paint', 'Any'];
const EYE_LASHES = ['Natural', 'Long', 'Thick', 'False Lashes', 'Voluminous', 'Wispy', 'Doll Lashes', 'Any'];
const EYE_BROWS = ['Natural', 'Thin', 'Thick', 'Bushy', 'Arched', 'Straight', 'Scouse Brow', 'Bleached', 'Slit', 'Any'];
const LIP_MAKEUPS = ['None', 'Clear Gloss', 'Nude Lip Gloss', 'Pink Lipstick', 'Red Lipstick', 'Dark Lipstick', 'Black Lipstick', 'Matte', 'Glossy', 'Ombre Lips', 'Any'];
const LIP_SIZES = ['Thin', 'Average', 'Full', 'Plump', 'Overlined', 'Any'];
const FRECKLES = ['None', 'Light', 'Heavy', 'Faux Freckles', 'Across nose and cheeks', 'Full face', 'Any'];
const EXPRESSIONS = ['Neutral', 'Smiling', 'Grinning', 'Laughing', 'Smirking', 'Pouting', 'Serious', 'Frowning', 'Angry', 'Sad', 'Crying', 'Surprised', 'Shocked', 'Confused', 'Winking', 'Tongue Out', 'Seductive', 'Intimidating', 'Thoughtful'];

const GLASSES = ['None', 'Reading Glasses', 'Wire-rimmed', 'Thick-rimmed', 'Sunglasses', 'Aviators', 'Wayfarers', 'Goggles', 'Cyberpunk Visor', 'Any'];
const HEADWEARS = ['None', 'Hat', 'Beanie', 'Baseball Cap', 'Snapback', 'Fedora', 'Beret', 'Cowboy Hat', 'Helmet', 'Crown', 'Tiara', 'Headband', 'Bandana', 'Hijab', 'Turban', 'Any'];
const TOPWEARS = ['T-shirt', 'Crop Top', 'Tank Top', 'Blouse', 'Button-up Shirt', 'Sweater', 'Hoodie', 'Turtleneck', 'Corset', 'Sports Bra', 'Tube Top', 'None', 'Any'];
const MIDDLEWEARS = ['Jacket', 'Coat', 'Cardigan', 'Blazer', 'Vest', 'Puffer Jacket', 'Leather Jacket', 'Denim Jacket', 'Trench Coat', 'Winter Coat', 'Velvet Jacket', 'None', 'Any'];
const BOTTOMWEARS = ['Jeans', 'Trousers', 'Slacks', 'Shorts', 'Skirt', 'Mini Skirt', 'Maxi Skirt', 'Leggings', 'Sweatpants', 'Joggers', 'Track Pants', 'Cargo Pants', 'Fishnet Stockings', 'None', 'Any'];
const FOOTWEARS = ['Sneakers', 'Boots', 'Combat Boots', 'Platform Boots', 'High Heels', 'Stilettos', 'Sandals', 'Flats', 'Loafers', 'Oxfords', 'Barefoot', 'Any'];
const FULL_BODYWEARS = ['Dress', 'Summer Dress', 'Evening Gown', 'Suit', 'Tuxedo', 'Jumpsuit', 'Romper', 'Tracksuit', 'Latex Suit', 'Armor', 'Sci-Fi Suit', 'Swimsuit', 'Bikini', 'None', 'Any'];
const ACCESSORIES = ['Glasses', 'Sunglasses', 'Choker', 'Spiked Collar', 'Scarf', 'Hat', 'Beanie', 'Baseball Cap', 'Headband', 'Gloves', 'Fishnet Gloves', 'Watch', 'Belt', 'Backpack', 'Crossbody Bag', 'Bum Bag', 'Purse', 'Tie', 'Bowtie', 'Hair Clips', 'Tattoos', 'Acrylic Nails'];
const JEWELRY = ['Gold Hoop Earrings', 'Massive Gold Hoops', 'Silver Hoop Earrings', 'Stud Earrings', 'Dangle Earrings', 'Cross Earrings', 'Gold Chain Necklace', 'Thick Gold Chain', 'Silver Chain Necklace', 'Nameplate Necklace', 'Pentagram Necklace', 'Pendant Necklace', 'Pearl Necklace', 'Bracelet', 'Bangle', 'Rings', 'Sovereign Ring', 'Anklet', 'Brooch'];
const PIERCINGS = ['Ear Lobes', 'Helix Piercing', 'Tragus Piercing', 'Industrial Piercing', 'Nose Ring', 'Septum Piercing', 'Lip Ring', 'Medusa Piercing', 'Eyebrow Piercing', 'Tongue Piercing', 'Navel Piercing', 'Dimple Piercings', 'Bridge Piercing'];
const POSES = ['Standing', 'Sitting', 'Kneeling', 'Squatting', 'Slav Squat', 'Laying Down', 'On All Fours', 'Leaning', 'Walking', 'Running', 'Jumping', 'Dancing', 'Fighting Pose', 'Arms Crossed', 'Hands on Hips', 'Looking at Camera', 'Looking Away', 'Looking over shoulder', 'Dynamic Action Pose', 'Relaxed Pose', 'V-sign', 'Middle Finger'];

export const CharacterPromptAccordion = memo(() => {
  const dispatch = useAppDispatch();
  const { characters } = useAppSelector(selectCharacterPromptSlice);
  const { isOpen: isSavedModalOpen, onOpen: onOpenSavedModal, onClose: onCloseSavedModal } = useDisclosure();

  return (
    <Accordion allowMultiple>
      <AccordionItem>
        <AccordionButton>
          <Box as="span" flex="1" textAlign="left" fontWeight="semibold">
            Character Prompts
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel pb={4}>
          <datalist id="genders-list">{GENDERS.map(g => <option key={g} value={g} />)}</datalist>
          <datalist id="ages-list">{AGES.map(a => <option key={a} value={a} />)}</datalist>
          <datalist id="ethnicities-list">{ETHNICITIES.map(e => <option key={e} value={e} />)}</datalist>
          <datalist id="skin-tones-list">{SKIN_TONES.map(s => <option key={s} value={s} />)}</datalist>
          <datalist id="body-types-list">{BODY_TYPES.map(b => <option key={b} value={b} />)}</datalist>
          <datalist id="body-shapes-list">{BODY_SHAPES.map(b => <option key={b} value={b} />)}</datalist>
          
          <datalist id="hair-colors-list">{HAIR_COLORS.map(h => <option key={h} value={h} />)}</datalist>
          <datalist id="hair-styles-list">{HAIR_STYLES.map(h => <option key={h} value={h} />)}</datalist>
          <datalist id="hair-lengths-list">{HAIR_LENGTHS.map(h => <option key={h} value={h} />)}</datalist>
          <datalist id="hair-textures-list">{HAIR_TEXTURES.map(h => <option key={h} value={h} />)}</datalist>
          
          <datalist id="foundations-list">{FOUNDATIONS.map(f => <option key={f} value={f} />)}</datalist>
          <datalist id="blushes-list">{BLUSHES.map(b => <option key={b} value={b} />)}</datalist>
          <datalist id="eye-colors-list">{EYE_COLORS.map(e => <option key={e} value={e} />)}</datalist>
          <datalist id="eye-makeups-list">{EYE_MAKEUPS.map(e => <option key={e} value={e} />)}</datalist>
          <datalist id="eye-lashes-list">{EYE_LASHES.map(e => <option key={e} value={e} />)}</datalist>
          <datalist id="eye-brows-list">{EYE_BROWS.map(e => <option key={e} value={e} />)}</datalist>
          <datalist id="lip-makeups-list">{LIP_MAKEUPS.map(l => <option key={l} value={l} />)}</datalist>
          <datalist id="lip-sizes-list">{LIP_SIZES.map(l => <option key={l} value={l} />)}</datalist>
          <datalist id="freckles-list">{FRECKLES.map(f => <option key={f} value={f} />)}</datalist>
          <datalist id="expressions-list">{EXPRESSIONS.map(e => <option key={e} value={e} />)}</datalist>

          <datalist id="glasses-list">{GLASSES.map(g => <option key={g} value={g} />)}</datalist>
          <datalist id="headwears-list">{HEADWEARS.map(h => <option key={h} value={h} />)}</datalist>
          <datalist id="topwears-list">{TOPWEARS.map(t => <option key={t} value={t} />)}</datalist>
          <datalist id="middlewears-list">{MIDDLEWEARS.map(m => <option key={m} value={m} />)}</datalist>
          <datalist id="bottomwears-list">{BOTTOMWEARS.map(b => <option key={b} value={b} />)}</datalist>
          <datalist id="footwears-list">{FOOTWEARS.map(f => <option key={f} value={f} />)}</datalist>
          <datalist id="full-bodywears-list">{FULL_BODYWEARS.map(f => <option key={f} value={f} />)}</datalist>
          <datalist id="accessories-list">{ACCESSORIES.map(a => <option key={a} value={a} />)}</datalist>
          <datalist id="jewelry-list">{JEWELRY.map(j => <option key={j} value={j} />)}</datalist>
          <datalist id="piercings-list">{PIERCINGS.map(p => <option key={p} value={p} />)}</datalist>
          <datalist id="poses-list">{POSES.map(p => <option key={p} value={p} />)}</datalist>

          <Flex justifyContent="space-between" mb={4}>
            <Button leftIcon={<PiFloppyDiskBold />} onClick={onOpenSavedModal} size="sm" variant="ghost">
              Saved Library
            </Button>
            <Button leftIcon={<PiPlusBold />} onClick={() => dispatch(characterAdded())} size="sm">
              Add Character
            </Button>
          </Flex>

          <Accordion allowMultiple>
            {characters.map((char, index) => (
              <CharacterAccordionItem key={char.id} char={char} index={index} />
            ))}
          </Accordion>

          <SavedCharactersModal isOpen={isSavedModalOpen} onClose={onCloseSavedModal} />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
});

CharacterPromptAccordion.displayName = 'CharacterPromptAccordion';
