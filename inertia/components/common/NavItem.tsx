import React from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import { Link } from '@inertiajs/react';

type NavItemProps = {
  title: string;
  isExpanded: boolean;
  nav: {
    key: string;
    name: string;
    icon: JSX.Element;
    link: string | false;
    subNav?: { key: string; name: string; link: string }[];
  }[];
};

export default function NavItem({ title, nav, isExpanded: isOpen }: NavItemProps) {
  // Get the active path segments from the URL
  const active = window.location.pathname.split('/')[2];
  const subActive = window.location.pathname.split('/')[3];

  return (
    <div className="border-t border-black/5 py-4">
      {/* Title section, hidden if not expanded */}
      <div className={`${!isOpen && 'hidden'} whitespace-nowrap mb-2`}>
        <span className="text-secondary-500 text-sm px-4">{title}</span>
      </div>
      <Accordion allowToggle className="flex flex-col gap-2">
        {nav.map((item) => (
          <React.Fragment key={item.key}>
            {item.subNav ? (
              <>
                {isOpen ? (
                  <AccordionItem key={item.key} border={0}>
                    {({ isExpanded }) => (
                      <>
                        <AccordionButton
                          as={Button}
                          className={`${isExpanded ? 'bg-primary-400 text-white hover:bg-primary-400 rounded-t-md rounded-b-none' : 'bg-transparent hover:bg-secondary-100 rounded-md hover:rounded-md'} h-10 w-full flex items-center gap-2 font-semibold`}
                        >
                          {item.icon}
                          <Box as="span" flex="1" textAlign="left">
                            {item.name}
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel className="flex flex-col bg-secondary-50 rounded-b-md gap-2 px-1 py-1">
                          {item.subNav?.map((subItem) => (
                            <Link
                              id={subItem.key}
                              key={subItem.key}
                              href={subItem.link}
                              className={`${subActive === subItem.key ? 'text-primary-500' : ''} hover:text-primary-500 border-b border-black/5 w-full text-sm flex items-center gap-2 py-2 px-4 font-semibold last:border-b-0`}
                            >
                              <span>{subItem.name}</span>
                            </Link>
                          ))}
                        </AccordionPanel>
                      </>
                    )}
                  </AccordionItem>
                ) : (
                  <Menu placement="right-start">
                    <MenuButton
                      as={IconButton}
                      aria-label="Sub-menu"
                      icon={item.icon}
                      className="hover:bg-secondary-100 font-semibold"
                      variant="ghost"
                    />
                    <MenuList className="p-1">
                      {item.subNav.map((subItem) => (
                        <MenuItem as={Link} id={subItem.key} key={subItem.key} href={subItem.link}>
                          {subItem.name}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                )}
              </>
            ) : (
              <>
                {isOpen ? (
                  <Button
                    as={Link}
                    key={item.key}
                    href={item.link as string}
                    className={`${active === item.key ? 'bg-primary-400 text-white hover:bg-primary-400' : 'hover:bg-secondary-100'} w-full rounded-md flex items-center gap-2 font-semibold`}
                    variant="ghost"
                  >
                    {item.icon}
                    <Box as="span" flex="1" textAlign="left">
                      {item.name}
                    </Box>
                  </Button>
                ) : (
                  <IconButton
                    aria-label="Options"
                    icon={item.icon}
                    className="hover:bg-secondary-100 font-semibold"
                    variant="ghost"
                    as={Link}
                    href={item.link as string}
                  />
                )}
              </>
            )}
          </React.Fragment>
        ))}
      </Accordion>
    </div>
  );
}
