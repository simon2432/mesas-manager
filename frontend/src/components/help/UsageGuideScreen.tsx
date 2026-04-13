import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { welcomeTheme } from "@/src/constants/authTheme";
import { mesasTheme } from "@/src/constants/mesasTheme";

import { SuggestedImageCallout } from "./SuggestedImageCallout";

const figura1 = require("../../../assets/images/figura1.png");
const figura2 = require("../../../assets/images/figura2.png");
const figura3 = require("../../../assets/images/figura3.png");

type IonName = ComponentProps<typeof Ionicons>["name"];

const cardShadow =
  Platform.OS === "ios"
    ? {
        shadowColor: "#1a1a1a",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      }
    : { elevation: 2 };

function SectionHeader({ title, icon }: { title: string; icon: IonName }) {
  return (
    <View style={styles.sectionHeaderRow}>
      <View style={styles.sectionIconWrap}>
        <Ionicons name={icon} size={20} color={welcomeTheme.orange} />
      </View>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
    </View>
  );
}

function SectionBlock({
  icon,
  title,
  children,
}: {
  icon: IonName;
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.sectionBlock}>
      <SectionHeader title={title} icon={icon} />
      {children}
    </View>
  );
}

function Bullet({ children }: { children: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletIconWrap}>
        <Ionicons name="checkmark" size={14} color={welcomeTheme.orange} />
      </View>
      <Text style={styles.body}>{children}</Text>
    </View>
  );
}

export function UsageGuideScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
      >
        <View style={[styles.hero, cardShadow]}>
          <View style={styles.heroKickerRow}>
            <View style={styles.heroKickerDot} />
            <Text style={styles.heroKicker}>Guía de uso</Text>
          </View>
          <View style={styles.heroIconCircle}>
            <Ionicons
              name="sparkles-outline"
              size={28}
              color={welcomeTheme.orange}
            />
          </View>
          <Text style={styles.heroTitle}>Cómo usar Mesas Manager</Text>
          <Text style={styles.lead}>
            Guía breve del flujo operativo: mesas en vivo, números del día,
            historial y administración del catálogo.
          </Text>
        </View>

        <SectionBlock icon="apps-outline" title="Navegación principal">
          <Text style={styles.body}>
            La barra inferior agrupa las áreas que usás con más frecuencia:
            <Text style={styles.em}> Mesas</Text> (salón),
            <Text style={styles.em}> Dashboard</Text> (indicadores),
            <Text style={styles.em}> Historial</Text> (sesiones cerradas),
            <Text style={styles.em}> Menú</Text> (platos y precios) y
            <Text style={styles.em}> Más</Text> (meseros, layouts de planta y
            esta guía).
          </Text>
        </SectionBlock>

        <SectionBlock icon="grid-outline" title="Mesas — operación en el salón">
          <Text style={styles.body}>
            Es la pantalla central del turno. Arriba ves dos números resumidos
            del día actual según el servidor: ocupación de mesas y personas
            sentadas respecto de la capacidad de las mesas activas.
          </Text>
          <View style={styles.bulletGroup}>
            <Bullet>
              Solo se listan mesas activas en salón. Las que están dadas de baja
              en catálogo se administran en Gestión mesas.
            </Bullet>
            <Bullet>
              Podés aplicar varios layouts de planta a la vez si no comparten
              mesas: cada uno aparece agrupado; el resto queda debajo, sin salir
              del servicio.
            </Bullet>
            <Bullet>
              Mesa libre y activa: podés abrir sesión (mozo, cantidad de
              comensales). Mesa ocupada: accedé al detalle para cargar ítems del
              menú o cerrar la cuenta.
            </Bullet>
            <Bullet>
              Desactivar una mesa en el salón solo está permitido si está libre;
              el sistema evita cortar una mesa con consumo abierto.
            </Bullet>
          </View>

          <SuggestedImageCallout
            title="Mesas"
            description="Encabezado con métricas del día y grilla de mesas."
            source={figura1}
          />

          <Text style={[styles.body, styles.bodyAfterCallout]}>
            Desde la barra de herramientas podés ir al catálogo de layouts o a
            Gestión mesas (altas, edición y activación de mesas en el catálogo).
          </Text>
        </SectionBlock>

        <SectionBlock
          icon="git-compare-outline"
          title="Gestión mesas vs. vista Mesas"
        >
          <Text style={styles.body}>
            Gestión mesas trabaja sobre el catálogo completo (numeración,
            capacidad, si la mesa puede usarse en el salón). La vista Mesas solo
            refleja las que están activas para el servicio y es donde se abren y
            cierran las sesiones.
          </Text>
        </SectionBlock>

        <SectionBlock icon="stats-chart-outline" title="Dashboard">
          <Text style={styles.body}>
            Consolidá indicadores por un día puntual o por un período (rango de
            fechas). El modo día muestra métricas en vivo para el día
            seleccionado cuando coincide con el «hoy» del servidor; en días
            anteriores los números son históricos.
          </Text>
          <View style={styles.bulletGroup}>
            <Bullet>
              No podés elegir fechas futuras: el tope de calendario sigue la
              fecha del servidor una vez iniciada sesión.
            </Bullet>
            <Bullet>
              El rango tiene un límite de días; si lo superás, el sistema no
              consulta hasta que acotes las fechas.
            </Bullet>
          </View>

          <SuggestedImageCallout
            title="Dashboard"
            description="Modo día o período e indicadores."
            source={figura2}
          />
        </SectionBlock>

        <SectionBlock icon="time-outline" title="Historial">
          <Text style={styles.body}>
            Listado de sesiones ya cerradas por día. Elegís la fecha, revisás
            totales y podés abrir el detalle de una sesión para ver ítems y
            totales facturados en ese cierre.
          </Text>
        </SectionBlock>

        <SectionBlock icon="restaurant-outline" title="Menú (catálogo)">
          <Text style={styles.body}>
            Altas y edición de platos o bebidas con precio y descripción. Los
            ítems desactivados no se ofrecen al cargar consumos en una mesa,
            pero conservan historial. No hay borrado físico: se desactivan desde
            la edición o las acciones de estado.
          </Text>
        </SectionBlock>

        <SectionBlock icon="layers-outline" title="Más — Meseros y Layouts">
          <Text style={styles.body}>
            <Text style={styles.em}>Meseros:</Text> alta, edición y baja lógica
            (desactivar) del personal que puede asignarse al abrir una mesa.
          </Text>
          <Text style={[styles.body, styles.paragraphSpaced]}>
            <Text style={styles.em}>Layouts:</Text> definís qué mesas forman
            cada distribución de planta. Al aplicar un layout en inicio, solo se
            encienden en salón las mesas que el layout marca como activas y que
            ya estaban activas en catálogo; las mesas activas que no entran en
            el dibujo siguen visibles debajo de los recuadros. Podés combinar
            todos los layouts que quieras mientras no se solapen; si un layout
            nuevo choca con alguno ya aplicado, el diálogo «Layouts incompatibles»
            ofrece reemplazar (se quitan solo los que comparten mesas) o dejar
            todo como está.
          </Text>

          <SuggestedImageCallout
            title="Layouts"
            description="Catálogo o confirmación al aplicar planta."
            source={figura3}
          />
        </SectionBlock>

        <SectionBlock icon="receipt-outline" title="Sesión y consumo">
          <Text style={styles.body}>
            Al abrir mesa elegís mozo y cantidad de comensales. En el detalle de
            la sesión sumás líneas del menú, ajustás cantidades o notas, y
            cerrás cuando el cliente paga. El cierre deja la mesa libre y mueve
            la información al historial del día correspondiente.
          </Text>
        </SectionBlock>

        <SectionBlock icon="log-out-outline" title="Cierre de sesión en la app">
          <Text style={styles.body}>
            En <Text style={styles.em}>Más → Cerrar sesión</Text> salís de la
            cuenta en este dispositivo. No afecta las mesas abiertas en el
            servidor; solo limpia el token local.
          </Text>
        </SectionBlock>
      </ScrollView>
    </SafeAreaView>
  );
}

const surfaceTint = "#FFF8F0";
const pageBg = "#f2f3f5";

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: pageBg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 36,
  },
  hero: {
    marginBottom: 8,
    padding: 22,
    paddingTop: 20,
    borderRadius: 16,
    backgroundColor: welcomeTheme.white,
    borderLeftWidth: 4,
    borderLeftColor: welcomeTheme.orange,
  },
  heroKickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  heroKickerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: welcomeTheme.orange,
  },
  heroKicker: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: welcomeTheme.orange,
  },
  heroIconCircle: {
    alignSelf: "flex-start",
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: surfaceTint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: welcomeTheme.textDark,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  lead: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 24,
    color: mesasTheme.muted,
  },
  sectionBlock: {
    marginTop: 14,
    padding: 18,
    paddingTop: 16,
    borderRadius: 14,
    backgroundColor: welcomeTheme.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e8eaed",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: mesasTheme.border,
  },
  sectionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: surfaceTint,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: welcomeTheme.textDark,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    color: welcomeTheme.textDark,
  },
  bodyAfterCallout: {
    marginTop: 4,
  },
  paragraphSpaced: {
    marginTop: 12,
  },
  em: {
    fontWeight: "700",
    color: welcomeTheme.textDark,
  },
  bulletGroup: {
    marginTop: 12,
    gap: 2,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 10,
    paddingRight: 4,
  },
  bulletIconWrap: {
    marginTop: 3,
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: surfaceTint,
    alignItems: "center",
    justifyContent: "center",
  },
});
